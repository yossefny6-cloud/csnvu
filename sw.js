const CACHE_NAME = 'cs-ai-cache-v15';
const urlsToCache = [
  '/',
  '/index.html',
  '/login.html',
  '/register.html',
  '/css/base.css?v=11.0',
  '/css/app.css?v=11.0',
  '/css/auth.css?v=11.0',
  '/js/common.js',
  '/js/subjects.js',
  '/js/chat.js?v=2.7',
  '/js/firebase-config.js',
  '/img/robot_logo.jpg'
];

// 1. Install Service Worker
self.addEventListener('install', (event) => {
  self.skipWaiting(); // Force the waiting service worker to become the active service worker.
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
});

// 2. Activate & Clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim()); // Take control of all clients immediately.
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// 3. Fetch from Cache or Network
self.addEventListener('fetch', (event) => {
  // Only cache GET requests. Ignore POST, PUT, DELETE (like Firebase Auth)
  if (event.request.method !== 'GET') return;

  // Ignore API and external requests to prevent CORS issues
  if (event.request.url.includes('googleapis.com') || 
      event.request.url.includes('wa.me') ||
      event.request.url.includes('firestore')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse; // Return from cache if found
        }
        
        return fetch(event.request).then((networkResponse) => {
          // Check if response is valid for caching
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
            return networkResponse;
          }

          // Cache the new resource
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return networkResponse;
        }).catch((err) => {
          // If offline and resource not in cache, fallback to index.html for navigation
          if (event.request.mode === 'navigate') {
            return caches.match('/');
          }
          throw err;
        });
      })
  );
});
