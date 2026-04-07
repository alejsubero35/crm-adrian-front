import { getAllPending, deletePendingAndNotify, PendingInvoice } from './offlineQueue';

// Simple sync: attempt to POST queued invoices using app's http client.
export async function syncPendingInvoices() {
  const list = await getAllPending();
  console.debug('[offlineSync] syncPendingInvoices called, pending=', list?.length ?? 0);
  if (!list || list.length === 0) return { synced: 0 };

  let synced = 0;
  // Import http here to avoid circular deps at module load
  const httpModule = await import('@/lib/http');
  const http = (httpModule as unknown as { default: { post: (path: string, body: unknown) => Promise<unknown> } }).default;
  const meta = (import.meta as unknown) as { env?: Record<string, string> };

  for (const item of list) {
    try {
  console.debug('[offlineSync] syncing item', item.id);
      const path = meta.env?.VITE_API_CREATE_INVOICE_PATH || '/invoices';
  await http.post(path, item.payload);
  await deletePendingAndNotify(item.id);
  console.debug('[offlineSync] synced item', item.id);
      synced++;
    } catch (e) {
      // If one fails, skip and try next; likely still offline or server error
  console.warn('[offlineSync] Failed to sync pending invoice', item.id, e);
    }
  }

  return { synced };
}

export function registerSyncListeners() {
  // Try to sync when we come online
  window.addEventListener('online', () => {
  console.debug('[offlineSync] online event detected, attempting sync');
    // fire and forget
    syncPendingInvoices().then((res) => {
      try {
        if (res && res.synced > 0) {
      console.debug('[offlineSync] sync completed, synced=', res.synced);
          const w = window as unknown as { CustomEvent?: { new(type: string, init?: unknown): Event } };
          if (w.CustomEvent) {
            window.dispatchEvent(new w.CustomEvent('pos:pendingSynced', { detail: res }));
          }
        }
      } catch (e) {
        // ignore
      }
    }).catch(console.error);
  });
}

async function tryRegisterBackgroundSync() {
  if (!('serviceWorker' in navigator)) return;
  console.debug('[offlineSync] tryRegisterBackgroundSync');
  try {
    const registration = await navigator.serviceWorker.ready;
    // Check SyncManager support
    if ('sync' in registration) {
      try {
        // attempt to register sync; browser may throw if offline
        const reg = registration as unknown as { sync?: { register: (tag: string) => Promise<void> } };
        if (reg.sync && typeof reg.sync.register === 'function') {
          await reg.sync.register('sync-pending-invoices');
          console.debug('[offlineSync] SyncManager.register succeeded');
          return true;
        }
        return false;
      } catch (e) {
        console.debug('[offlineSync] SyncManager.register failed', e);
        // registration failed (maybe already registered)
        return false;
      }
    }
    return false;
  } catch (e) {
    console.debug('[offlineSync] navigator.serviceWorker.ready failed', e);
    return false;
  }
}

export function enableAutoBackgroundSync() {
  // When pending list changes, attempt to register a background sync
  const handler = async () => {
    const ok = await tryRegisterBackgroundSync();
    if (!ok && 'serviceWorker' in navigator && navigator.serviceWorker.controller) {
      // Fallback: post message to SW to trigger immediate processing
      navigator.serviceWorker.controller.postMessage({ type: 'pos:triggerSync' });
    }
  };

  window.addEventListener('pos:pendingChanged', handler);
  // Also try on load
  window.addEventListener('load', handler);
}

// Listen to messages from the service worker and translate to window events
if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('message', (ev: MessageEvent) => {
    try {
      const data = ev.data || {};
      if (data && data.type === 'pos:pendingSynced') {
        const w = window as unknown as { CustomEvent?: { new(type: string, init?: unknown): Event } };
        if (w.CustomEvent) window.dispatchEvent(new w.CustomEvent('pos:pendingSynced', { detail: data.detail }));
      }
    } catch (e) {
      // ignore
    }
  });
}
