// Service Worker untuk PWA + Pusher Beams
importScripts('https://js.pusher.com/beams/service-worker.js');

const CACHE_NAME = 'keuanganku-v2';
const urlsToCache = [
  '/manifest.json',
  '/icon.svg',
];

// Jangan aktifkan caching saat development (localhost)
const isDev = self.location.hostname === 'localhost' || self.location.hostname === '127.0.0.1';

// Install service worker dan cache resources
self.addEventListener('install', (event) => {
  if (isDev) {
    self.skipWaiting();
    return;
  }
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

// Fetch strategy: Network First di dev, Cache First di production
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests dan chrome-extension
  if (event.request.method !== 'GET' || event.request.url.startsWith('chrome-extension://')) {
    return;
  }

  // Di development: selalu fetch dari network, jangan intercept apapun
  if (isDev) {
    return;
  }

  // Di production: skip WebSocket dan Vite HMR
  const url = new URL(event.request.url);
  if (url.protocol === 'ws:' || url.protocol === 'wss:') {
    return;
  }

  // Jangan cache HTML — selalu ambil dari network agar app selalu up-to-date
  if (event.request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(event.request).catch(() => caches.match('/index.html'))
    );
    return;
  }

  // Cache First untuk assets statis (gambar, font, dll)
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(event.request)
          .then((response) => {
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });

            return response;
          })
          .catch(() => caches.match('/index.html'));
      })
  );
});

// Push notifications handler — Pusher Beams format
self.addEventListener('push', (event) => {
  if (!event.data) return;

  let payload;
  try {
    payload = event.data.json();
  } catch {
    // Fallback jika bukan JSON
    payload = { notification: { title: 'Keuanganku', body: event.data.text() } };
  }

  // Pusher Beams mengirim: { notification: { title, body, icon, data } }
  const notification = payload.notification ?? payload;
  const title = notification.title ?? 'Keuanganku';
  const body = notification.body ?? '';
  const icon = notification.icon ?? '/icon.svg';
  const data = notification.data ?? {};

  const options = {
    body,
    icon,
    badge: '/icon.svg',
    vibrate: [200, 100, 200],
    data: { ...data, url: '/' },
    tag: data.tag ?? `luminary-${Date.now()}`,
    renotify: false,
    requireInteraction: false,
    silent: false,
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
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