self.addEventListener('install', e => self.skipWaiting());
self.addEventListener('activate', e => clients.claim());
self.addEventListener('fetch', e => e.respondWith(fetch(e.request).catch(() => caches.match(e.request))));

// Handle incoming push notification
self.addEventListener('push', e => {
  const data = e.data?.json() || { title: 'Booking Baru!', body: 'Ada booking baru masuk.' };
  e.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon || '/logo.png',
      badge: '/logo.png',
      tag: data.tag || 'frs-booking',
      vibrate: [200, 100, 200, 100, 200],
      requireInteraction: true,
      data: { url: data.data?.url || '/admin.html' }
    })
  );
});

// Handle notification click — open admin page
self.addEventListener('notificationclick', e => {
  e.notification.close();
  const url = e.notification.data?.url || '/admin.html';
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      for (const client of list) {
        if (client.url.includes('admin') && 'focus' in client) return client.focus();
      }
      return clients.openWindow(url);
    })
  );
});
