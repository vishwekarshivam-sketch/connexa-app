import { Platform } from 'react-native';

export function registerServiceWorker() {
  if (Platform.OS !== 'web') return;

  // ONLY register in production to avoid aggressive dev caching
  if (process.env.NODE_ENV !== 'production') {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(registrations => {
        for (let registration of registrations) {
          registration.unregister();
        }
      });
    }
    return;
  }

  if (!document.querySelector('link[rel="manifest"]')) {
    const manifest = document.createElement('link');
    manifest.rel = 'manifest';
    manifest.href = '/manifest.json';
    document.head.appendChild(manifest);
  }

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').then(registration => {
        console.log('SW registered: ', registration);
      }).catch(registrationError => {
        console.log('SW registration failed: ', registrationError);
      });
    });

    // Handle messages from the service worker
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data?.type === 'NAVIGATE' && event.data.path) {
        console.log('SW deep link navigation:', event.data.path);
        // Dispatch a custom event that the navigation system can listen to
        window.dispatchEvent(new CustomEvent('sw-navigate', { detail: { path: event.data.path } }));
      }
    });
  }
}
