// Din Asistanı - Custom Service Worker (Web Push & Notification Handlers)

// ─── 1. API İSTEKLERİ: Service Worker Bypass ────────────────────────────────
self.addEventListener("fetch", function (event) {
  if (event.request.url.includes("/api/")) {
    return; // Network-only
  }
});

// ─── 2. Push Event Listener ──────────────────────────────────────────────────
self.addEventListener("push", function (event) {
  if (event.data) {
    let data;
    try {
      data = event.data.json();
    } catch (e) {
      data = { title: "Din Asistanı", body: event.data.text() };
    }
    const options = {
      body: data.body || "Namaz vakti girdi.",
      icon: "/icons/icon-192x192.png",
      badge: "/icons/icon-192x192.png",
      vibrate: [100, 50, 100],
      data: { url: data.url || "/" }
    };
    event.waitUntil(self.registration.showNotification(data.title || "Din Asistanı", options));
  }
});

// ─── 3. Notification Click Listener ──────────────────────────────────────────
self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data.url || "/"));
});
