// Service Worker untuk Pusher Beams — background push notifications
importScripts("https://js.pusher.com/beams/service-worker.js");

// Handle push events yang datang saat app tidak terbuka
self.addEventListener("push", (event) => {
  if (!event.data) return;

  let payload;
  try {
    payload = event.data.json();
  } catch {
    payload = { notification: { title: "Luminary", body: event.data.text() } };
  }

  const { title, body, icon, data } = payload.notification || {};

  const options = {
    body: body || "",
    icon: icon || "/icon-192.png",
    badge: "/icon-192.png",
    data: data || {},
    vibrate: [200, 100, 200],
    requireInteraction: false,
    tag: "luminary-notif",
  };

  event.waitUntil(
    self.registration.showNotification(title || "Luminary", options)
  );
});

// Handle notification click — buka atau fokus ke app
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // Jika app sudah terbuka, fokus ke tab tersebut
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          return client.focus();
        }
      }
      // Jika tidak ada tab yang terbuka, buka tab baru
      if (clients.openWindow) {
        return clients.openWindow("/app");
      }
    })
  );
});
