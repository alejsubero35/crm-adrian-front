// Minimal IndexedDB helper for simple key-value stores (no external deps)
export function openDB(dbName: string, version = 1, upgrade?: (db: IDBDatabase) => void): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(dbName, version);
    req.onupgradeneeded = (ev) => {
      try {
        if (upgrade) upgrade(req.result);
      } catch (e) {
        console.error('idb upgrade error', e);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function withStore<T>(dbName: string, storeName: string, mode: IDBTransactionMode, cb: (store: IDBObjectStore) => Promise<T> | T) {
  const db = await openDB(dbName, 1, (d) => {
    if (!d.objectStoreNames.contains(storeName)) {
      d.createObjectStore(storeName, { keyPath: 'id' });
    }
  });
  return new Promise<T>((resolve, reject) => {
    const tx = db.transaction(storeName, mode);
    const store = tx.objectStore(storeName);
    Promise.resolve(cb(store)).then((r) => {
      tx.oncomplete = () => resolve(r);
      tx.onerror = () => reject(tx.error);
    }).catch(reject);
  });
}
