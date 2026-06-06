import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { requireSupabase } from '@/lib/supabase';
import { messaging } from '@/lib/firebase';
import { getToken } from 'firebase/messaging';

const NOTIFICATION_ASKED_KEY = 'connexa_notification_asked';
const PLACEHOLDER_PROJECT_ID = '00000000-0000-0000-0000-000000000000';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export async function hasAskedForNotifications() {
  const asked = await AsyncStorage.getItem(NOTIFICATION_ASKED_KEY);
  return asked === 'true';
}

export async function setNotificationAsked() {
  await AsyncStorage.setItem(NOTIFICATION_ASKED_KEY, 'true');
}

// Native (Expo) push uses 'expo' sentinels for the encryption columns; web push
// (VAPID) stores the real endpoint + p256dh/auth keys the Web Push Protocol needs.
// For FCM, we use 'fcm' as sentinels and store the FCM token in 'endpoint'.
export interface PushRegistration {
  endpoint: string;
  p256dh: string;
  auth: string;
  platform: 'android' | 'ios' | 'web' | 'fcm';
}

const VAPID_PUBLIC_KEY = process.env.EXPO_PUBLIC_VAPID_PUBLIC_KEY ?? '';

async function registerWebPush(): Promise<PushRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator) || !messaging) {
    console.warn('FCM unsupported in this environment.');
    return null;
  }
  if (!VAPID_PUBLIC_KEY) {
    console.warn('FCM disabled: EXPO_PUBLIC_VAPID_PUBLIC_KEY not set.');
    return null;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return null;

    // Use our custom service worker registration
    const registration = await navigator.serviceWorker.ready;
    const token = await getToken(messaging, {
      vapidKey: VAPID_PUBLIC_KEY,
      serviceWorkerRegistration: registration,
    });

    if (!token) {
      console.warn('Failed to get FCM token.');
      return null;
    }

    return {
      endpoint: token,
      p256dh: 'fcm',
      auth: 'fcm',
      platform: 'fcm',
    };
  } catch (err) {
    console.error('FCM Token generation failed:', err);
    return null;
  }
}

async function registerNativePush(): Promise<PushRegistration | null> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (!Device.isDevice) return null;

  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId || Constants.easConfig?.projectId;
  // Placeholder/unset projectId would make getExpoPushTokenAsync throw in a build.
  if (!projectId || projectId === PLACEHOLDER_PROJECT_ID) {
    console.warn('Expo push disabled: no real EAS projectId set (run `eas init`).');
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') return null;

  try {
    const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
    return {
      endpoint: token,
      p256dh: 'expo',
      auth: 'expo',
      platform: Platform.OS === 'ios' ? 'ios' : 'android',
    };
  } catch (err) {
    console.warn('getExpoPushTokenAsync failed:', err);
    return null;
  }
}

export async function registerForPushNotificationsAsync(): Promise<PushRegistration | null> {
  await setNotificationAsked();
  return Platform.OS === 'web' ? registerWebPush() : registerNativePush();
}

export async function savePushToken(userId: string, reg: PushRegistration) {
  const { error } = await requireSupabase()
    .from('push_subscriptions')
    .upsert({
      user_id: userId,
      endpoint: reg.endpoint,
      p256dh: reg.p256dh,
      auth: reg.auth,
      platform: reg.platform,
      status: 'active',
      last_used_at: new Date().toISOString(),
    }, {
      onConflict: 'user_id, endpoint'
    });

  if (error) {
    console.error('Error saving push token:', error);
  }
}
