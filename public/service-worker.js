// Service Worker untuk PWA + Pusher Beams
importScripts('https://js.pusher.com/beams/service-worker.js');

const CACHE_NAME = 'keuanganku-v2';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-72x72.png',
  '/icon-96x96.png',
  '/icon-128x128.png',
  '/icon-144x144.png',
  '/icon-152x152.png',
  '/icon-192x192.png',
  '/icon-384x384.png',
  '/icon-512x512.png',
  '/service-worker.js',
  '/splash-iphone5.png',
  '/splash-iphone6.png',
  '/splash-iphoneplus.png',
  '/splash-iphonex.png',
  '/splash-ipad.png'
];

// Install service worker dan cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate service worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch strategy: Cache First, fallback to network
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests and chrome-extension
  if (event.request.method !== 'GET' || event.request.url.startsWith('chrome-extension://')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // Return cached response if found
        if (cachedResponse) {
          return cachedResponse;
        }

        // Otherwise fetch from network
        return fetch(event.request)
          .then((response) => {
            // Check if we received a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response
            const responseToCache = response.clone();

            // Cache the new response
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch(() => {
            // If both cache and network fail, show offline page
            return caches.match('/index.html');
          });
      })
  );
});

// Push notifications handler
self.addEventListener('push', (event) => {
  const data = event.data?.json();
  
  if (data) {
    const options = {
      body: data.notification.body,
      icon: data.notification.icon || '/icon-192.png',
      badge: '/badge-72.png',
      vibrate: [200, 100, 200],
      data: data.notification.data,
      actions: [
        {
          action: 'open',
          title: 'Buka Aplikasi'
        },
        {
          action: 'dismiss',
          title: 'Tutup'
        }
      ],
      tag: 'financial-notification',
      renotify: true,
      requireInteraction: true
    };

    event.waitUntil(
      self.registration.showNotification(data.notification.title, options)
    );
  }
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then((windowClients) => {
          // Check if there's already a window/tab open with the target URL
          for (const client of windowClients) {
            if (client.url === '/' && 'focus' in client) {
              return client.focus();
            }
          }
          
          // If not, open a new window/tab
          if (clients.openWindow) {
            return clients.openWindow('/');
          }
        })
    );
  }
});

// Push subscription change handler
self.addEventListener('pushsubscriptionchange', (event) => {
  event.waitUntil(
    self.registration.pushManager.subscribe(event.oldSubscription.options)
      .then((subscription) => {
        // Send new subscription to server
        return fetch('/api/push-subscription', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(subscription)
        });
      })
  );
});

// Background sync for offline data
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-transactions') {
    event.waitUntil(syncTransactions());
  }
});

async function syncTransactions() {
  // Implement offline transaction sync
  const transactions = await getPendingTransactions();
  
  for (const transaction of transactions) {
    try {
      await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transaction)
      });
      
      // Remove from pending
      await removePendingTransaction(transaction.id);
    } catch (error) {
      console.error('Failed to sync transaction:', error);
    }
  }
}

async function getPendingTransactions() {
  // Get pending transactions from IndexedDB
  return [];
}

async function removePendingTransaction(id) {
  // Remove transaction from IndexedDB
}