importScripts('https://storage.googleapis.com/workbox-cdn/releases/7.0.0/workbox-sw.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Initialize Firebase in the service worker
firebase.initializeApp({
  apiKey: "AIzaSyB-1RTFqmg79PGNYnsldnV3zk2sCLIjiU4",
  authDomain: "connexa-59539.firebaseapp.com",
  projectId: "connexa-59539",
  storageBucket: "connexa-59539.firebasestorage.app",
  messagingSenderId: "1090291775014",
  appId: "1:1090291775014:web:36c0f443e8ceb416dfd8e7",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title || 'Connexa';
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/icons/app-icon-192.png',
    badge: '/icons/badge-96.png',
    data: payload.data,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

if (workbox) {
  // Use core, routing, and strategies
  const { routing, strategies, expiration } = workbox;

  // 1. Network First for the app shell (SPA entry point)
  // This ensures we always try to get the latest HTML/JS bundle.
  routing.registerRoute(
    ({ request }) => request.mode === 'navigate',
    new strategies.NetworkFirst({
      cacheName: 'html-cache',
      plugins: [
        new expiration.ExpirationPlugin({
          maxAgeSeconds: 24 * 60 * 60, // 1 day
        }),
      ],
    })
  );

  // 2. Cache First for static assets like fonts and icons
  routing.registerRoute(
    ({ request, url }) => 
      request.destination === 'font' || 
      request.destination === 'image' && url.origin === self.location.origin,
    new strategies.CacheFirst({
      cacheName: 'static-assets-cache',
      plugins: [
        new expiration.ExpirationPlugin({
          maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
          maxEntries: 50,
        }),
      ],
    })
  );

  // 3. Stale While Revalidate for Supabase Storage (user photos)
  routing.registerRoute(
    ({ url }) => url.hostname.includes('supabase.co') && url.pathname.includes('/storage/'),
    new strategies.StaleWhileRevalidate({
      cacheName: 'supabase-storage',
      plugins: [
        new expiration.ExpirationPlugin({
          maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
          maxEntries: 100,
        }),
      ],
    })
  );

  // 4. Network First for API calls
  routing.registerRoute(
    ({ url }) => url.pathname.startsWith('/api/') || url.hostname.includes('supabase.co') && !url.pathname.includes('/storage/'),
    new strategies.NetworkFirst({
      cacheName: 'api-cache',
      plugins: [
        new expiration.ExpirationPlugin({
          maxAgeSeconds: 60, // 60s stale max as per spec
        }),
      ],
    })
  );

  // Handle Push Notifications (Web Push fallback)
  // Note: For full FCM support, firebase-messaging-sw.js will be needed.
  self.addEventListener('push', (event) => {
    let data = {};
    try {
      data = event.data?.json() || {};
    } catch (e) {
      console.error("Failed to parse push data", e);
    }
  
    if (!data || !data.title) return;
  
    event.waitUntil(
      self.registration.showNotification(data.title || 'Connexa', {
        body: data.body,
        icon: '/icons/app-icon-192.png',
        badge: '/icons/badge-96.png',
        data: { deep_link: data.deep_link },
        tag: data.category || 'default',
        renotify: false,
      })
    );
  });
  
  self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const deepLink = event.notification.data?.deep_link || '/';
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then((clientList) => {
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.focus();
            client.postMessage({ type: 'NAVIGATE', path: deepLink });
            return;
          }
        }
        clients.openWindow(self.location.origin + deepLink);
      })
    );
  });

  self.addEventListener('install', () => {
    self.skipWaiting();
  });
  
  self.addEventListener('activate', () => {
    self.clients.claim();
  });

} else {
  console.log(`Workbox didn't load`);
}
