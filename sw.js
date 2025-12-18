
const CACHE_NAME = 'unitimer-v1';
// Solo cacheamos lo esencial para asegurar que el registro no falle por un 404
const ASSETS = [
  './',
  './index.html',
  './manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS).catch(err => console.warn('Error precacheando activos:', err));
    })
  );
});

self.addEventListener('fetch', (event) => {
  // Estrategia: Network First, falling back to cache
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});
