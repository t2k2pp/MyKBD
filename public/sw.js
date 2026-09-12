/**
 * STUDIO SYNTH WORKSTATION - Progressive Web App Service Worker
 * Offline Cache & Standalone Synthesizer runtime
 */

const CACHE_NAME = 'studio-synth-workstation-v3';
const scopeUrl = self.registration ? self.registration.scope : self.location.origin + '/';
const getPath = (rel) => new URL(rel, scopeUrl).pathname;

const PRECACHE_URLS = [
  getPath('./'),
  getPath('index.html'),
  getPath('manifest.webmanifest'),
  getPath('icon.svg'),
  getPath('pwa-192x192.png'),
  getPath('pwa-512x512.png'),
  getPath('apple-touch-icon.png')
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            return caches.delete(name);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // For app navigation, use network first, fall back to cached index.html
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match(getPath('index.html')) || caches.match(getPath('./'));
      })
    );
    return;
  }

  // Cache-first strategy for static assets and fonts
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Fetch in background to update cache (stale-while-revalidate)
        fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, networkResponse);
            });
          }
        }).catch(() => {});
        return cachedResponse;
      }

      return fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        return new Response('Offline asset unavailable', { status: 503 });
      });
    })
  );
});
