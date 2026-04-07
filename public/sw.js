
// Service Worker: precache + navigation fallback + runtime caching
// This file is compatible with VitePWA/Workbox injection (it will use
// `self.__WB_MANIFEST` when provided) but also contains safe fallbacks.

/* global workbox */

// Base path derived from registration scope (e.g., '/app/')
const BASE = new URL(self.registration.scope).pathname;

// Import Workbox from CDN if not injected by build tool
try {
  importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-sw.js');
  console.debug('SW: workbox imported');
} catch (e) {
  // ignore - browser may block importScripts during dev, we'll fallback to minimal behavior
}

if (self.workbox) {
  workbox.setConfig({debug: false});
  workbox.core.skipWaiting();
  workbox.core.clientsClaim();
  console.debug('SW: workbox configured skipWaiting+clientsClaim');

  // Combine injected manifest with our offline page
  const precacheManifest = (self.__WB_MANIFEST || []).concat([{ url: BASE + 'offline.html', revision: '1' }]);
  workbox.precaching.precacheAndRoute(precacheManifest);

  // Navigation route fallback for SPA: serve index.html (precache) and fallback to offline.html
  try {
    const indexCacheKey = workbox.precaching.getCacheKeyForURL(BASE + 'index.html');
    workbox.routing.registerNavigationRoute(indexCacheKey || (BASE + 'offline.html'));
  } catch (e) {
    // If something fails, still try a generic navigation handler below
  }

  // Runtime caching for Google Fonts and common CDNs
  workbox.routing.registerRoute(
    ({url}) => url.origin.includes('fonts.googleapis.com') || url.origin.includes('fonts.gstatic.com'),
    new workbox.strategies.CacheFirst({
      cacheName: 'google-fonts',
      plugins: [
        new workbox.expiration.ExpirationPlugin({ maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 30 })
      ]
    })
  );

  workbox.routing.registerRoute(
    ({url}) => url.pathname.endsWith('.png') || url.pathname.endsWith('.jpg') || url.pathname.endsWith('.svg'),
    new workbox.strategies.CacheFirst({ cacheName: 'images', plugins: [new workbox.expiration.ExpirationPlugin({ maxEntries: 100 })] })
  );
} else {
  // Minimal install/activate handlers if Workbox is not available
  self.addEventListener('install', (event) => {
    self.skipWaiting();
  console.debug('SW: install (fallback)');
    event.waitUntil(
      caches.open('app-shell-v1').then((cache) => {
        return cache.addAll([BASE + 'offline.html', BASE + 'index.html']);
      })
    );
  });

  self.addEventListener('activate', (event) => {
  console.debug('SW: activate (fallback)');
    event.waitUntil(self.clients.claim());
  });

  // Basic navigation fallback
  self.addEventListener('fetch', (event) => {
    if (event.request.mode === 'navigate') {
      event.respondWith(
        fetch(event.request).catch(() => caches.match(BASE + 'offline.html'))
      );
    }
  });
}

// Handle push notifications
self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? {};

  const options = {
    body: data.body || 'Nueva notificación',
    icon: BASE + 'img/android-icon-192x192.png',
    badge: BASE + 'img/apple-icon-180x180.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/'
    }
  };

  event.waitUntil(
    self.registration.showNotification(
      data.title || 'Venta Simplify', 
      options
    )
  );
  console.debug('SW: push shown', data);
});

// Open URL when notification is clicked
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const url = event.notification.data.url;
  
  event.waitUntil(
    clients.matchAll({type: 'window'}).then((windowClients) => {
      // Check if there is already a window open with the URL
      for (const client of windowClients) {
        if (client.url === url && 'focus' in client) {
          return client.focus();
        }
      }
      // If no window is open, open a new one
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});

self.addEventListener('install', () => console.debug('SW: install event'));
self.addEventListener('activate', () => console.debug('SW: activate event'));

// ---- Background sync: process pending invoices stored in IndexedDB ----
function openIDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('venta-offline-db', 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains('pending-sales')) db.createObjectStore('pending-sales', { keyPath: 'id' });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function processPendingInvoices() {
  const db = await openIDB();
  const tx = db.transaction('pending-sales', 'readwrite');
  const store = tx.objectStore('pending-sales');
  const req = store.openCursor();
  const synced = { count: 0 };

  return new Promise((resolve) => {
    req.onsuccess = async (e) => {
      const cursor = e.target.result;
      if (!cursor) {
        resolve(synced.count);
        return;
      }
      const item = cursor.value;
      try {
  console.debug('SW: processing pending invoice', item.id);
        // POST to backend; use relative path so it targets same origin
        await fetch('/invoices', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item.payload),
        });
        cursor.delete();
        synced.count++;
        cursor.continue();
      } catch (err) {
        // If a fetch fails, stop here and resolve - we'll retry later
        console.warn('SW: failed to sync invoice', err);
        resolve(synced.count);
      }
    };
    req.onerror = () => resolve(synced.count);
  });
}

// Handle SyncManager events
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-pending-invoices') {
    event.waitUntil(
      (async () => {
        try {
          const synced = await processPendingInvoices();
          // Notify clients about sync result
          const all = await clients.matchAll({ type: 'window' });
          for (const c of all) {
            c.postMessage({ type: 'pos:pendingSynced', detail: { synced } });
          }
        } catch (e) {
          console.error('SW sync error', e);
        }
      })()
    );
  }
});

// Allow pages to message the SW to trigger an immediate sync
self.addEventListener('message', (event) => {
  const data = event.data || {};
  if (data && data.type === 'pos:triggerSync') {
    event.waitUntil(
      (async () => {
        try {
          const synced = await processPendingInvoices();
          const all = await clients.matchAll({ type: 'window' });
          for (const c of all) c.postMessage({ type: 'pos:pendingSynced', detail: { synced } });
        } catch (e) {
          console.error('SW: triggerSync failed', e);
        }
      })()
    );
  }
});

// Also add a safe fetch handler to return offline page for navigations when Workbox didn't register navigation route
self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(BASE + 'offline.html'))
    );
  }
});
