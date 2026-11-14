// NutriTrack Service Worker for Fast Mobile PWA Caching
const CACHE_NAME = 'nutritrack-pwa-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './targets.js',
  './usda-api.js',
  './chat-parser.js',
  './excel-handler.js',
  './app.js',
  './global-foods.js',
  './manifest.json',
  './icons/icon-192.svg',
  './icons/icon-512.svg'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('NutriTrack: Service worker caching core assets');
      return cache.addAll(ASSETS_TO_CACHE).catch(err => {
        console.warn('Some assets could not be cached immediately:', err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('NutriTrack: Purging old cache', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  // Stale-while-revalidate for local assets, network-first for external APIs
  if (e.request.url.includes('api.nal.usda.gov') || e.request.url.includes('openfoodfacts.org')) {
    e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
    return;
  }

  e.respondWith(
    caches.match(e.request).then((cached) => {
      const fetchPromise = fetch(e.request).then((networkRes) => {
        if (networkRes && networkRes.status === 200) {
          const clone = networkRes.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(e.request, clone));
        }
        return networkRes;
      }).catch(() => cached);

      return cached || fetchPromise;
    })
  );
});
