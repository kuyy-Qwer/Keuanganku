// Service Worker untuk Pusher Beams
importScripts('https://js.pusher.com/beams/service-worker.js');

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
      ]
    };

    event.waitUntil(
      self.registration.showNotification(data.notification.title, options)
    );
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'open') {
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then((windowClients) => {
          if (windowClients.length > 0) {
            return windowClients[0].focus();
          } else {
            return clients.openWindow('/');
          }
        })
    );
  }
});

self.addEventListener('pushsubscriptionchange', (event) => {
  event.waitUntil(
    self.registration.pushManager.subscribe(event.oldSubscription.options)
      .then((subscription) => {
        // Kirim subscription baru ke server
        return fetch('/api/push-subscription', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(subscription)
        });
      })
  );
});