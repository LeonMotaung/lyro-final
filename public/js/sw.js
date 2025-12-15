const CACHE_NAME = 'lyro-maths-v1';
const urlsToCache = [
    '/',
    '/index',
    '/practice',
    '/practice/grade12',
    '/practice/grade11',
    '/practice/grade10',
    '/admin/index',
    '/admin/content',
    '/admin/users',
    '/admin/settings',
    '/admin/reports',
    '/admin/analytics',
    '/admin/notifications',
    '/admin/support',
    '/admin/logout',
    '/login',
    '/signup',
    '/onboarding',
    '/learn',
    '/paper1',
    '/paper2',
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
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
    );
});

// Listen for push events
self.addEventListener('push', event => {
    const data = event.data.json() || { title: 'Lyro Tutor', body: 'Time for a study session!' };
    const options = {
        body: data.body,
        icon: 'images/lyro.png',
        badge: 'images/lyro.png' // Icon for the notification tray
    };

    // If the push data includes an image, add it to the options.
    if (data.image) {
        options.image = data.image;
    }

    // If the push data includes actions, add them to the options.
    if (data.actions) {
        options.actions = data.actions;
    }

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

// Handle notification click
self.addEventListener('notificationclick', event => {
    // Always close the notification when it's clicked.
    event.notification.close();

    // Check which action was clicked
    if (event.action === 'start-studying') {
        // User clicked "Start Studying", open the main learning page.
        event.waitUntil(clients.openWindow('learn.php'));
    } else if (event.action === 'snooze') {
        // User clicked "Snooze". For now, we just log it.
        // A more complex implementation could schedule a new notification for later.
        console.log('Snooze action clicked.');
    } else {
        // User clicked the main body of the notification (default action).
        event.waitUntil(clients.openWindow('learn.php'));
    }
});

// Serve cached content when offline
self.addEventListener('fetch', event => {
    // Use a "Stale-While-Revalidate" strategy
    event.respondWith(
        caches.match(event.request)
            .then(cachedResponse => {
                const fetchPromise = fetch(event.request).then(
                    networkResponse => {
                        caches.open(CACHE_NAME).then(cache => {
                            cache.put(event.request, networkResponse.clone());
                        });
                        return networkResponse;
                    }
                );

                // Return cached response immediately, and update cache in background
                return cachedResponse || fetchPromise;
            })
    );
});