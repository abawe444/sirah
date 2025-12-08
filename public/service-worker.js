const CACHE_VERSION = 'sarh-alitqan-v2.1';
const CACHE_STATIC = `${CACHE_VERSION}-static`;
const CACHE_DYNAMIC = `${CACHE_VERSION}-dynamic`;
const CACHE_IMAGES = `${CACHE_VERSION}-images`;

const STATIC_ASSETS = [
  '/',
  '/offline.html',
  '/manifest.json'
];

const MAX_CACHE_SIZE = 50;
const MAX_AGE = 7 * 24 * 60 * 60 * 1000;

const limitCacheSize = (cacheName, maxItems) => {
  caches.open(cacheName).then(cache => {
    cache.keys().then(keys => {
      if (keys.length > maxItems) {
        cache.delete(keys[0]).then(() => limitCacheSize(cacheName, maxItems));
      }
    });
  });
};

self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker...', event);
  event.waitUntil(
    caches.open(CACHE_STATIC)
      .then((cache) => {
        console.log('[SW] Precaching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[SW] Skip waiting');
        return self.skipWaiting();
      })
      .catch(err => console.error('[SW] Install failed:', err))
  );
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker...', event);
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName.startsWith('sarh-alitqan-') && 
                cacheName !== CACHE_STATIC && 
                cacheName !== CACHE_DYNAMIC && 
                cacheName !== CACHE_IMAGES) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
            return Promise.resolve();
          })
        );
      })
      .then(() => {
        console.log('[SW] Claiming clients');
        return self.clients.claim();
      })
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET') {
    return;
  }

  if (url.origin === location.origin) {
    if (request.mode === 'navigate') {
      event.respondWith(
        fetch(request)
          .then(response => {
            const responseClone = response.clone();
            caches.open(CACHE_DYNAMIC).then(cache => {
              cache.put(request, responseClone);
            });
            return response;
          })
          .catch(() => {
            return caches.match(request)
              .then(response => response || caches.match('/offline.html'));
          })
      );
    } else if (request.destination === 'image') {
      event.respondWith(
        caches.match(request)
          .then(response => {
            return response || fetch(request)
              .then(fetchResponse => {
                return caches.open(CACHE_IMAGES)
                  .then(cache => {
                    cache.put(request, fetchResponse.clone());
                    limitCacheSize(CACHE_IMAGES, 60);
                    return fetchResponse;
                  });
              })
              .catch(() => {
                return new Response(
                  '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect fill="#f97316" width="200" height="200"/><text fill="#fff" font-size="48" x="50%" y="50%" text-anchor="middle" dy=".3em">صرح</text></svg>',
                  { headers: { 'Content-Type': 'image/svg+xml' } }
                );
              });
          })
      );
    } else {
      event.respondWith(
        caches.match(request)
          .then(response => {
            return response || fetch(request)
              .then(fetchResponse => {
                return caches.open(CACHE_DYNAMIC)
                  .then(cache => {
                    cache.put(request, fetchResponse.clone());
                    limitCacheSize(CACHE_DYNAMIC, MAX_CACHE_SIZE);
                    return fetchResponse;
                  });
              });
          })
      );
    }
  }
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('[SW] Received SKIP_WAITING message');
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CLEAR_CACHE') {
    console.log('[SW] Clearing all caches');
    event.waitUntil(
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
      })
    );
  }
});

self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received', event);
  
  let data = {
    title: 'صرح الإتقان',
    body: 'لديك إشعار جديد',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-96x96.png',
    tag: 'default',
    requireInteraction: false,
    vibrate: [200, 100, 200],
    data: {}
  };

  if (event.data) {
    try {
      const payload = event.data.json();
      data = { ...data, ...payload };
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon,
    badge: data.badge,
    tag: data.tag,
    requireInteraction: data.requireInteraction,
    vibrate: data.vibrate,
    data: data.data,
    dir: 'rtl',
    lang: 'ar',
    actions: data.actions || []
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked', event);
  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

self.addEventListener('notificationclose', (event) => {
  console.log('[SW] Notification closed', event);
});

const SYNC_STORAGE_KEY = 'pending-sync-data';
const SYNC_QUEUE_KEY = 'sync-queue';

self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered', event.tag);
  
  if (event.tag === 'sync-attendance-data') {
    event.waitUntil(syncPendingData());
  } else if (event.tag === 'sync-daily-record') {
    event.waitUntil(syncDailyRecords());
  } else if (event.tag === 'sync-employee-data') {
    event.waitUntil(syncEmployeeData());
  } else if (event.tag === 'sync-reports') {
    event.waitUntil(syncReports());
  } else if (event.tag.startsWith('sync-')) {
    event.waitUntil(syncPendingData());
  }
});

async function syncPendingData() {
  try {
    console.log('[SW] Starting sync of pending data...');
    
    const queue = await getFromIndexedDB(SYNC_QUEUE_KEY) || [];
    
    if (queue.length === 0) {
      console.log('[SW] No pending data to sync');
      return;
    }

    console.log(`[SW] Found ${queue.length} items to sync`);
    
    const successfulSyncs = [];
    const failedSyncs = [];

    for (const item of queue) {
      try {
        await processSyncItem(item);
        successfulSyncs.push(item.id);
        console.log(`[SW] Successfully synced item ${item.id}`);
      } catch (error) {
        console.error(`[SW] Failed to sync item ${item.id}:`, error);
        failedSyncs.push(item.id);
      }
    }

    const remainingQueue = queue.filter(item => !successfulSyncs.includes(item.id));
    await saveToIndexedDB(SYNC_QUEUE_KEY, remainingQueue);

    if (successfulSyncs.length > 0) {
      await notifyClients({
        type: 'SYNC_SUCCESS',
        count: successfulSyncs.length
      });
    }

    if (failedSyncs.length > 0) {
      console.log(`[SW] ${failedSyncs.length} items failed to sync, will retry later`);
    }

    console.log('[SW] Sync completed');
  } catch (error) {
    console.error('[SW] Sync failed:', error);
    throw error;
  }
}

async function processSyncItem(item) {
  const { type, data, timestamp } = item;
  
  console.log(`[SW] Processing sync item type: ${type}`);

  switch (type) {
    case 'attendance-record':
      await syncAttendanceRecord(data);
      break;
    case 'daily-record':
      await syncDailyRecord(data);
      break;
    case 'employee-update':
      await syncEmployeeUpdate(data);
      break;
    case 'report':
      await syncReport(data);
      break;
    case 'notification-read':
      await syncNotificationRead(data);
      break;
    default:
      console.warn(`[SW] Unknown sync type: ${type}`);
  }
}

async function syncAttendanceRecord(data) {
  await notifyClients({
    type: 'SYNC_ATTENDANCE',
    data: data
  });
}

async function syncDailyRecord(data) {
  await notifyClients({
    type: 'SYNC_DAILY_RECORD',
    data: data
  });
}

async function syncEmployeeUpdate(data) {
  await notifyClients({
    type: 'SYNC_EMPLOYEE',
    data: data
  });
}

async function syncReport(data) {
  await notifyClients({
    type: 'SYNC_REPORT',
    data: data
  });
}

async function syncNotificationRead(data) {
  await notifyClients({
    type: 'SYNC_NOTIFICATION',
    data: data
  });
}

async function syncDailyRecords() {
  try {
    console.log('[SW] Syncing daily records...');
    await syncPendingData();
  } catch (error) {
    console.error('[SW] Daily records sync failed:', error);
    throw error;
  }
}

async function syncEmployeeData() {
  try {
    console.log('[SW] Syncing employee data...');
    await syncPendingData();
  } catch (error) {
    console.error('[SW] Employee data sync failed:', error);
    throw error;
  }
}

async function syncReports() {
  try {
    console.log('[SW] Syncing reports...');
    await syncPendingData();
  } catch (error) {
    console.error('[SW] Reports sync failed:', error);
    throw error;
  }
}

async function getFromIndexedDB(key) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('SyncDatabase', 1);
    
    request.onerror = () => reject(request.error);
    
    request.onsuccess = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('syncStore')) {
        resolve(null);
        return;
      }
      
      const transaction = db.transaction(['syncStore'], 'readonly');
      const store = transaction.objectStore('syncStore');
      const getRequest = store.get(key);
      
      getRequest.onsuccess = () => resolve(getRequest.result?.value);
      getRequest.onerror = () => reject(getRequest.error);
    };
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('syncStore')) {
        db.createObjectStore('syncStore', { keyPath: 'key' });
      }
    };
  });
}

async function saveToIndexedDB(key, value) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('SyncDatabase', 1);
    
    request.onerror = () => reject(request.error);
    
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['syncStore'], 'readwrite');
      const store = transaction.objectStore('syncStore');
      const putRequest = store.put({ key, value });
      
      putRequest.onsuccess = () => resolve();
      putRequest.onerror = () => reject(putRequest.error);
    };
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('syncStore')) {
        db.createObjectStore('syncStore', { keyPath: 'key' });
      }
    };
  });
}

async function notifyClients(message) {
  const allClients = await clients.matchAll({ includeUncontrolled: true });
  
  for (const client of allClients) {
    client.postMessage(message);
  }
}

self.addEventListener('periodicsync', (event) => {
  console.log('[SW] Periodic sync triggered', event.tag);
  
  if (event.tag === 'periodic-data-sync') {
    event.waitUntil(syncPendingData());
  }
});

// Push Notifications
self.addEventListener('push', (event) => {
  console.log('[SW] Push received', event);

  let data = { title: 'صرح الإتقان', body: 'لديك إشعار جديد', icon: '/icons/icon-192x192.png' };

  if (event.data) {
    data = event.data.json();
  }

  const options = {
    body: data.body,
    icon: data.icon,
    badge: '/icons/icon-96x96.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'عرض',
        icon: '/icons/icon-96x96.png'
      },
      {
        action: 'close',
        title: 'إغلاق'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification click received', event);

  event.notification.close();

  if (event.action === 'explore') {
    // Open the app
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});
