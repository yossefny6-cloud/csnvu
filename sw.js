const CACHE_NAME = 'cs-ai-cache-v11';
const urlsToCache = [
  '/',
  '/index.html',
  '/login.html',
  '/register.html',
  '/css/base.css?v=8.0',
  '/css/app.css?v=8.0',
  '/css/auth.css?v=8.0',
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
  // لا نتدخل في طلبات قاعدة البيانات والـ API
  if (event.request.url.includes('firestore.googleapis.com') || 
      event.request.url.includes('generativelanguage.googleapis.com') ||
      event.request.url.includes('wa.me')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached response if found
        if (response) {
          return response;
        }
        return fetch(event.request).then(
          (response) => {
            // Check if we received a valid response
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone response to cache it dynamically
            var responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
  );
});
