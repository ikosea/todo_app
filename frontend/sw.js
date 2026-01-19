// Service Worker for Offline Support
const CACHE_NAME = 'productivity-app-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/frontend/desktop.html',
    '/frontend/apps/landing.html',
    '/frontend/apps/auth.html',
    '/frontend/css/desktop.css',
    '/frontend/css/window.css',
    '/frontend/css/cursor.css',
    '/frontend/css/apps.css',
    '/frontend/js/config.js',
    '/frontend/js/api.js',
    '/frontend/js/desktop.js',
    '/frontend/js/windowManager.js',
    '/frontend/js/windowApps.js',
    '/frontend/js/auth.js',
    '/frontend/js/todo.js',
    '/frontend/js/pomodoro.js',
    '/frontend/js/dashboard.js',
    '/frontend/js/trash.js',
    '/frontend/js/utils.js'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Service Worker: Caching files');
                return cache.addAll(urlsToCache);
            })
            .catch((error) => {
                console.error('Service Worker: Cache failed', error);
            })
    );
    self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Service Worker: Deleting old cache', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    return self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
    // Skip API requests - let them go to network
    if (event.request.url.includes('/api/')) {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Return cached version or fetch from network
                return response || fetch(event.request).then((response) => {
                    // Don't cache if not a valid response
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }

                    // Clone the response
                    const responseToCache = response.clone();

                    caches.open(CACHE_NAME)
                        .then((cache) => {
                            cache.put(event.request, responseToCache);
                        });

                    return response;
                });
            })
            .catch(() => {
                // If both cache and network fail, return offline page
                if (event.request.destination === 'document') {
                    return caches.match('/frontend/desktop.html');
                }
            })
    );
});

