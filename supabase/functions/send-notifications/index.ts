// Sends pending push notifications. Three transports:
//   - Native (Expo Go / EAS builds): Expo Push API. Subs flagged by p256dh='expo'.
//   - Firebase (Android PWA/TWA): FCM HTTP v1 API. Subs flagged by platform='fcm'.
//   - Web/PWA (iOS Safari, desktop): Web Push Protocol (VAPID, RFC 8291) via @negrel/webpush.
//
// Triggered every minute by the `fire-notification-batches` pg_cron job.
//
// Flow: find notifications with push_sent=false -> join active push_subscriptions
// -> route each sub to Expo, FCM, or Web Push by transport -> mark push_sent=true.
//
// Deploy: supabase functions deploy send-notifications --no-verify-jwt
// Requires secrets:
//   - VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT (web push)
//   - FIREBASE_SERVICE_ACCOUNT (JSON string from Admin SDK key)

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import * as webpush from "https://esm.sh/jsr/@negrel/webpush@0.3";
import { createRemoteJWKSet, jwtVerify, SignJWT } from "https://deno.land/x/jose@v4.14.4/index.ts";

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";
const BATCH_LIMIT = 200; // notifications processed per invocation
const EXPO_CHUNK = 100; // Expo accepts up to 100 messages per request

Deno.serve(async (req) => {
  // Shared-secret gate: only the pg_cron caller (which sends this header) may invoke.
  const expectedSecret = Deno.env.get("NOTIFICATION_CRON_SECRET");
  if (expectedSecret) {
    const got = req.headers.get("x-cron-secret");
    if (got !== expectedSecret) return json({ error: "unauthorized" }, 401);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceKey) {
    return json({ error: "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY" }, 500);
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });

  // 1. Pull pending notifications.
  const { data: notifs, error } = await supabase
    .from("notifications")
    .select("id, user_id, title, body, deep_link, category")
    .eq("push_sent", false)
    .order("created_at", { ascending: true })
    .limit(BATCH_LIMIT);

  if (error) {
    console.error("Error fetching notifications:", error.message);
    return json({ error: error.message }, 500);
  }
  
  if (!notifs || notifs.length === 0) {
    return json({ sent: 0, message: "nothing pending" });
  }

  // 2. Fetch active push subscriptions (Expo + FCM + web) for the affected users.
  const userIds = [...new Set(notifs.map((n: any) => n.user_id))];
  const { data: subs, error: subErr } = await supabase
    .from("push_subscriptions")
    .select("user_id, endpoint, p256dh, auth, platform")
    .eq("status", "active")
    .in("user_id", userIds);
  
  if (subErr) {
    console.error("Error fetching subscriptions:", subErr.message);
    return json({ error: subErr.message }, 500);
  }

  // Categorize subscriptions
  const expoByUser = new Map<string, string[]>();
  const fcmByUser = new Map<string, string[]>();
  const webByUser = new Map<string, Array<{ endpoint: string; p256dh: string; auth: string }>>();

  for (const s of (subs ?? []) as any[]) {
    const isExpoToken = s.p256dh === "expo" || 
                       (typeof s.endpoint === "string" && (s.endpoint.startsWith("ExponentPushToken") || s.endpoint.startsWith("ExpoPushToken")));

    if (isExpoToken) {
      const arr = expoByUser.get(s.user_id) ?? [];
      arr.push(s.endpoint);
      expoByUser.set(s.user_id, arr);
    } else if (s.platform === 'fcm') {
      const arr = fcmByUser.get(s.user_id) ?? [];
      arr.push(s.endpoint);
      fcmByUser.set(s.user_id, arr);
    } else if (s.endpoint && s.p256dh && s.auth) {
      const arr = webByUser.get(s.user_id) ?? [];
      arr.push({ endpoint: w.endpoint, p256dh: w.p256dh, auth: w.auth });
      webByUser.set(s.user_id, arr);
    }
  }

  // 3. Prepare message payloads
  const expoMessages: any[] = [];
  const fcmMessages: any[] = [];
  const webMessages: any[] = [];
  const notifIds = new Set<string>();

  for (const row of notifs as any[]) {
    notifIds.add(row.id);
    const commonData = { deep_link: row.deep_link, category: row.category, notification_id: row.id };

    // Expo
    for (const token of expoByUser.get(row.user_id) ?? []) {
      expoMessages.push({ to: token, title: row.title ?? "Connexa", body: row.body, data: commonData });
    }
    // FCM
    for (const token of fcmByUser.get(row.user_id) ?? []) {
      fcmMessages.push({
        message: {
          token: token,
          notification: { title: row.title ?? "Connexa", body: row.body },
          data: { 
            deep_link: row.deep_link || '', 
            category: row.category || '', 
            notification_id: row.id 
          },
          webpush: {
            fcm_options: { link: row.deep_link || '/' }
          }
        }
      });
    }
    // Web Push
    for (const w of webByUser.get(row.user_id) ?? []) {
      webMessages.push({
        sub: { endpoint: w.endpoint, keys: { p256dh: w.p256dh, auth: w.auth } },
        payload: { title: row.title ?? "Connexa", body: row.body, ...commonData },
      });
    }
  }

  const invalidTokens: string[] = [];

  // 4a. Dispatch Expo
  for (let i = 0; i < expoMessages.length; i += EXPO_CHUNK) {
    const chunk = expoMessages.slice(i, i + EXPO_CHUNK);
    try {
      const resp = await fetch(EXPO_PUSH_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(chunk),
      });
      if (resp.ok) {
        const result = await resp.json();
        result.data?.forEach((t: any, idx: number) => {
          if (t?.status === "error" && t?.details?.error === "DeviceNotRegistered") {
            invalidTokens.push(chunk[idx].to);
          }
        });
      }
    } catch (err) { console.error("Expo dispatch error", err); }
  }

  // 4b. Dispatch FCM (HTTP v1)
  const fcmAccessToken = await getFcmAccessToken();
  const fcmProjectId = getFcmProjectId();
  if (fcmMessages.length > 0 && fcmAccessToken && fcmProjectId) {
    for (const msg of fcmMessages) {
      try {
        const resp = await fetch(`https://fcm.googleapis.com/v1/projects/${fcmProjectId}/messages:send`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${fcmAccessToken}`
          },
          body: JSON.stringify(msg)
        });
        if (!resp.ok) {
          const errorData = await resp.json();
          if (resp.status === 404 || resp.status === 410 || (errorData.error?.status === 'NOT_FOUND')) {
            invalidTokens.push(msg.message.token);
          }
        }
      } catch (err) { console.error("FCM dispatch error", err); }
    }
  }

  // 4c. Dispatch Web Push
  const appServer = await getAppServer();
  if (webMessages.length > 0 && appServer) {
    for (const m of webMessages) {
      try {
        const subscriber = appServer.subscribe(m.sub);
        await subscriber.pushTextMessage(JSON.stringify(m.payload), {});
      } catch (err) {
        const status = (err as any)?.response?.status ?? (err as any)?.status;
        if (status === 404 || status === 410) invalidTokens.push(m.sub.endpoint);
      }
    }
  }

  // 5. Finalize
  const ids = Array.from(notifIds);
  await supabase.from("notifications").update({ push_sent: true, push_sent_at: new Date().toISOString() }).in("id", ids);

  if (invalidTokens.length > 0) {
    await supabase.from("push_subscriptions").update({ status: "expired" }).in("endpoint", invalidTokens);
  }

  return json({
    sent: expoMessages.length + fcmMessages.length + webMessages.length,
    expo: expoMessages.length,
    fcm: fcmMessages.length,
    web: webMessages.length,
    notifications: ids.length,
    deactivated: invalidTokens.length,
  });
});

// --- FCM Auth Helpers ---

function getFcmProjectId() {
  try {
    const sa = JSON.parse(Deno.env.get("FIREBASE_SERVICE_ACCOUNT") || "{}");
    return sa.project_id;
  } catch { return null; }
}

async function getFcmAccessToken() {
  const saContent = Deno.env.get("FIREBASE_SERVICE_ACCOUNT");
  if (!saContent) return null;
  
  try {
    const sa = JSON.parse(saContent);
    const now = Math.floor(Date.now() / 1000);
    
    // Create JWT for Google OAuth2
    const jwt = await new SignJWT({
      iss: sa.client_email,
      scope: "https://www.googleapis.com/auth/cloud-platform",
      aud: "https://oauth2.googleapis.com/token",
      exp: now + 3600,
      iat: now,
    })
    .setProtectedHeader({ alg: "RS256" })
    .sign(await Deno.permissions.query({ name: "env" }).then(() => importPrivateKey(sa.private_key)));

    const resp = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        assertion: jwt,
      }),
    });

    const data = await resp.json();
    return data.access_token;
  } catch (err) {
    console.error("FCM token error", err);
    return null;
  }
}

async function importPrivateKey(pem: string) {
  const pemHeader = "-----BEGIN PRIVATE KEY-----";
  const pemFooter = "-----END PRIVATE KEY-----";
  const pemContents = pem.substring(pemHeader.length, pem.length - pemFooter.length).replace(/\s/g, "");
  const binaryDerString = atob(pemContents);
  const binaryDer = new Uint8Array(binaryDerString.length);
  for (let i = 0; i < binaryDerString.length; i++) binaryDer[i] = binaryDerString.charCodeAt(i);
  
  return await crypto.subtle.importKey(
    "pkcs8",
    binaryDer,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );
}

// --- Web Push Helpers ---

function b64urlToBytes(s: string): Uint8Array {
  const pad = "=".repeat((4 - (s.length % 4)) % 4);
  const b64 = (s + pad).replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}
function bytesToB64url(b: Uint8Array): string {
  let bin = "";
  for (let i = 0; i < b.length; i++) bin += String.fromCharCode(b[i]);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function rawVapidToJwk(publicKey: string, privateKey: string) {
  const pub = b64urlToBytes(publicKey);
  const x = bytesToB64url(pub.slice(1, 33));
  const y = bytesToB64url(pub.slice(33, 65));
  const d = bytesToB64url(b64urlToBytes(privateKey));
  const base = { kty: "EC", crv: "P-256", x, y } as const;
  return {
    publicKey: { ...base, key_ops: ["verify"], ext: true },
    privateKey: { ...base, d, key_ops: ["sign"], ext: true },
  };
}

let appServerPromise: Promise<any | null> | undefined;
function getAppServer(): Promise<any | null> {
  if (appServerPromise) return appServerPromise;
  appServerPromise = (async () => {
    const publicKey = Deno.env.get("VAPID_PUBLIC_KEY");
    const privateKey = Deno.env.get("VAPID_PRIVATE_KEY");
    if (!publicKey || !privateKey) return null;
    try {
      const jwk = rawVapidToJwk(publicKey, privateKey);
      const vapidKeys = await webpush.importVapidKeys(jwk, { extractable: false });
      return await webpush.ApplicationServer.new({
        contactInformation: Deno.env.get("VAPID_SUBJECT") ?? "mailto:team@connexa.app",
        vapidKeys,
      });
    } catch (err) {
      console.error("Web Push init error", err);
      return null;
    }
  })();
  return appServerPromise;
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
