// Service Worker untuk Katalog Obat Hewan PWA (Offline-First)
const CACHE_NAME = 'katalog-obat-hewan-v7-open-access';

const STATIC_ASSETS = [
  './',
  './index.html',
  './css/styles.css',
  './js/app.js',
  './js/drugs-data.js',
  './js/indonesian-formulary-data.js',
  './js/indonesian-section.js',
  './js/calculator.js',
  './js/cart-prescription.js',
  './js/antimicrobial-guide-data.js',
  './js/prescription-guidelines.js',
  './js/terminology-data.js',
  './js/firebase-config.js',
  './manifest.json',
  './icon.svg'
];

// Precache static assets during installation
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[ServiceWorker] Caching core offline assets...');
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activate and clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[ServiceWorker] Clearing old cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Intercept network requests (Cache-First with Background Revalidation)
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Skip non-GET and Firebase authentication internal calls
  if (req.method !== 'GET' || url.pathname.includes('/__/auth/')) {
    return;
  }

  event.respondWith(
    caches.match(req).then((cachedResponse) => {
      if (cachedResponse) {
        // If cached and it's our own domain, revalidate in background if online
        if (url.origin === location.origin) {
          fetch(req).then((freshResponse) => {
            if (freshResponse && freshResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(req, freshResponse);
              });
            }
          }).catch(() => {
            // Offline - no problem, already serving from cache
          });
        }
        return cachedResponse;
      }

      // If not cached, fetch from network and save to cache
      return fetch(req).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200) {
          return networkResponse;
        }

        // Cache external assets (Tailwind, Phosphor Icons, Google Fonts, etc.)
        const clonedResponse = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(req, clonedResponse);
        });

        return networkResponse;
      }).catch(() => {
        // Fallback for navigation requests if network fails
        if (req.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});