// Din Asistanı - Custom Service Worker Handlers
// next-pwa v5 bu dosyayı otomatik olarak Workbox SW ile birleştirir

// ─── API İSTEKLERİ: Service Worker Bypass ────────────────────────────────────
// /api/ ile başlayan istekleri SW kesinlikle yakalamasın, doğrudan ağa iletsin
self.addEventListener("fetch", (event) => {
  if (event.request.url.includes("/api/")) {
    return; // Service Worker müdahale etmesin
  }
});

// ─── Push Event Handler ─────────────────────────────────────────────────────
self.addEventListener("push", (event) => {
  if (!event.data) return;

  let payload;
  try {
    payload = event.data.json();
  } catch {
    payload = {
      title: "Din Asistanı 🕌",
      body: event.data.text(),
      icon: "/icons/icon-192x192.png",
      badge: "/icons/icon-192x192.png",
    };
  }

  const { title, body, icon, badge, data } = payload;

  const options = {
    body: body || "Namaz vakti yaklaşıyor!",
    icon: icon || "/icons/icon-192x192.png",
    badge: badge || "/icons/icon-192x192.png",
    vibrate: [200, 100, 200],
    tag: (data && data.prayerKey) || "din-asistani-reminder",
    renotify: true,
    requireInteraction: true,
    data: data || { url: "/vakitler" },
  };

  event.waitUntil(
    self.registration.showNotification(title || "Din Asistanı 🕌", options)
  );
});

// ─── Notification Click Handler ─────────────────────────────────────────────
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl =
    (event.notification.data && event.notification.data.url) || "/vakitler";

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (
            client.url.includes(self.location.origin) &&
            "focus" in client
          ) {
            client.focus();
            return client.navigate(targetUrl);
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }
      })
  );
});
