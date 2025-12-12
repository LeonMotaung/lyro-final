const CACHE_NAME = 'lyro-maths-v2';
const urlsToCache = [
    '/',
    '/onboarding',
    '/learn',
    '/paper1',
    '/paper2',
    '/admin',
    '/practice',
    '/practice/grade12',
    '/practice/grade11',
    '/practice/grade10',
    '/css/styles.css',
    '/css/index.css',
    '/css/onboarding.css',
    '/css/learn.css',
    '/js/script.js',
    '/js/paper1.js',
    '/js/paper2.js',
    '/images/lyro.png',
    '/images/logo.png',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css',
    'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css',
    'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js',
    'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/contrib/auto-render.min.js',
    'https://cdn.tailwindcss.com',
    'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap',
    'https://polyfill.io/v3/polyfill.min.js?features=es6',
    'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js',
    'https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.2/dist/confetti.browser.min.js'
];

// Install the service worker and cache the static assets
self.addEventListener('install', event => {
    console.log('[Service Worker] Installing...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[Service Worker] Caching app shell');
                return cache.addAll(urlsToCache);
            })
            .then(() => self.skipWaiting())
    );
});

// Activate the service worker and clean up old caches
self.addEventListener('activate', event => {
    console.log('[Service Worker] Activating...');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('[Service Worker] Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Listen for push events
self.addEventListener('push', event => {
    const data = event.data ? event.data.json() : { title: 'Lyro Maths', body: 'Time for a study session!' };
    const options = {
        body: data.body,
        icon: '/images/lyro.png',
        badge: '/images/lyro.png',
        vibrate: [200, 100, 200],
        tag: 'lyro-notification',
        requireInteraction: false
    };

    if (data.image) {
        options.image = data.image;
    }

    if (data.actions) {
        options.actions = data.actions;
    }

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

// Handle notification click
self.addEventListener('notificationclick', event => {
    event.notification.close();

    if (event.action === 'start-studying') {
        event.waitUntil(clients.openWindow('/learn'));
    } else if (event.action === 'snooze') {
        console.log('[Service Worker] Snooze action clicked');
    } else {
        event.waitUntil(clients.openWindow('/learn'));
    }
});

// Serve cached content when offline - Network First, falling back to Cache
self.addEventListener('fetch', event => {
    event.respondWith(
        fetch(event.request)
            .then(response => {
                // If we got a valid response, clone it and update the cache
                if (response && response.status === 200) {
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, responseClone);
                    });
                }
                return response;
            })
            .catch(() => {
                // Network failed, try to get it from cache
                return caches.match(event.request).then(cachedResponse => {
                    if (cachedResponse) {
                        return cachedResponse;
                    }
                    // If not in cache and it's a navigation request, return the index page
                    if (event.request.mode === 'navigate') {
                        return caches.match('/');
                    }
                });
            })
    );
});
