// Minimal FCM Service Worker
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

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
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title || 'Connexa';
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/icons/app-icon-192.png',
    badge: '/icons/badge-96.png',
    data: payload.data,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
