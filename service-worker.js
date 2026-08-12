// Service Worker for GE GIPAD PWA
// Handles caching and offline functionality

const CACHE_NAME = 'ge-gipad-v1';
const RUNTIME_CACHE = 'ge-gipad-runtime-v1';

// Files to cache on install
const PRECACHE_URLS = [
    './',
    './index.html',
    './style.css',
    './app.js',
    './manifest.json'
];

/**
 * Install event - cache essential files
 */
self.addEventListener('install', (event) => {
    console.log('Service Worker installing...');
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('Caching essential files');
            return cache.addAll(PRECACHE_URLS);
        }).then(() => {
            console.log('Service Worker installed');
            return self.skipWaiting();
        }).catch((error) => {
            console.error('Installation failed:', error);
        })
    );
});

/**
 * Activate event - clean up old caches
 */
self.addEventListener('activate', (event) => {
    console.log('Service Worker activating...');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('Service Worker activated');
            return self.clients.claim();
        })
    );
});

/**
 * Fetch event - serve from cache, fall back to network
 */
self.addEventListener('fetch', (event) => {
    // Skip non-GET requests
    if (event.request.method !== 'GET') {
        return;
    }

    // Use cache first strategy
    event.respondWith(
        caches.match(event.request).then((response) => {
            // Return cached version if available
            if (response) {
                return response;
            }

            // Otherwise fetch from network
            return fetch(event.request).then((response) => {
                // Don't cache non-successful responses
                if (!response || response.status !== 200 || response.type === 'error') {
                    return response;
                }

                // Clone the response
                const responseToCache = response.clone();

                // Cache the response for future use
                caches.open(RUNTIME_CACHE).then((cache) => {
                    cache.put(event.request, responseToCache);
                });

                return response;
            }).catch(() => {
                // Return offline fallback if available
                console.log('Fetch failed, offline mode:', event.request.url);
                // You can return a custom offline page here if needed
                // return caches.match('./offline.html');
            });
        })
    );
});

/**
 * Handle messages from clients
 */
self.addEventListener('message', (event) => {
    console.log('Service Worker received message:', event.data);
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});