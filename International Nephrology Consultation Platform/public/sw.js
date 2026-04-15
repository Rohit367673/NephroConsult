const CACHE_NAME = 'nephroconsult-v3';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/robots.txt',
  '/sitemap.xml'
];

// Install event - cache essential files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches aggressively
self.addEventListener('activate', (event) => {
  event.waitUntil(
    // Aggressively clear ALL caches to prevent Safari white screen
    (async () => {
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map((cacheName) => {
          console.log('Clearing cache:', cacheName);
          return caches.delete(cacheName);
        }));
      }
    })().then(() => {
      // Force all clients to use new service worker immediately
      return self.clients.claim();
    })
  );
});

// Fetch event - serve from cache when possible
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // Skip API requests
  if (event.request.url.includes('/api/')) return;

  const url = new URL(event.request.url);
  const isNavigation = event.request.mode === 'navigate' || event.request.destination === 'document';

  // SPA route handling: serve index.html for all navigation requests (client-side routes)
  if (isNavigation) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // If 404 or offline, serve cached index.html
          if (!response || response.status === 404) {
            return caches.match('/index.html');
          }
          return response;
        })
        .catch(() => {
          // Offline fallback - serve cached index.html
          return caches.match('/index.html');
        })
    );
    return;
  }

  // Asset requests (JS, CSS, images) - stale-while-revalidate strategy
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        const fetchPromise = fetch(event.request)
          .then((networkResponse) => {
            // Update cache with fresh version
            if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => {
                if (event.request.url.match(/\.(js|css|woff2?|png|jpg|jpeg|svg)$/)) {
                  cache.put(event.request, responseToCache);
                }
              });
            }
            return networkResponse;
          })
          .catch(() => cachedResponse); // Fallback to cache if network fails

        // Return cached version immediately (stale-while-revalidate)
        return cachedResponse || fetchPromise;
      })
  );
});
