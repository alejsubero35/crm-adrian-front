import { withStore } from './idb';

const DB = 'venta-offline-db';
const STORE = 'pending-sales';

export interface PendingInvoice {
  id: string; // client-generated id
  payload: Record<string, unknown>;
  createdAt: string;
}

export async function enqueueInvoice(payload: Record<string, unknown>) {
  const item: PendingInvoice = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2,8)}`,
    payload,
    createdAt: new Date().toISOString(),
  };
  await withStore<void>(DB, STORE, 'readwrite', (store) => {
    store.put(item);
    return Promise.resolve();
  });
  // Notify app that pending list changed (use the window.CustomEvent if available so jsdom accepts the Event)
  try {
    if (typeof window !== 'undefined') {
  const w = window as unknown as { CustomEvent?: { new(type: string, init?: unknown): Event } };
      if (w.CustomEvent) {
        window.dispatchEvent(new w.CustomEvent('pos:pendingChanged'));
      }
    }
  } catch (e) {
    // ignore notification failures in non-DOM environments
  }
  // If we are online, try to trigger an immediate sync from the client
  try {
  if (typeof navigator !== 'undefined' && ((navigator as unknown) as { onLine?: boolean }).onLine) {
      const syncModule = await import('./offlineSync');
      // fire-and-forget
      syncModule.syncPendingInvoices().catch(() => {});
    }
  } catch (e) {
    // ignore
  }
  return item;
}

export async function getAllPending() {
  return withStore<PendingInvoice[]>(DB, STORE, 'readonly', (store) => {
    return new Promise<PendingInvoice[]>((resolve, reject) => {
      const list: PendingInvoice[] = [];
      const req = store.openCursor();
      req.onsuccess = (e: Event) => {
        const r = e.target as IDBRequest;
        const cursor = r.result as IDBCursorWithValue | null;
        if (cursor) {
          list.push(cursor.value as PendingInvoice);
          cursor.continue();
        } else {
          resolve(list);
        }
      };
      req.onerror = () => reject(req.error);
    });
  });
}

export async function deletePending(id: string) {
  return withStore<void>(DB, STORE, 'readwrite', (store) => {
    store.delete(id);
    return Promise.resolve();
  });
}

// Helper to delete and notify
export async function deletePendingAndNotify(id: string) {
  await deletePending(id);
  try {
    if (typeof window !== 'undefined') {
  const w = window as unknown as { CustomEvent?: { new(type: string, init?: unknown): Event } };
      if (w.CustomEvent) {
        window.dispatchEvent(new w.CustomEvent('pos:pendingChanged'));
      }
    }
  } catch (e) {
    // ignore
  }
}
