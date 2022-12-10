/**
 * Author: Andrei Dimitrascu.
 * ====================================================
 * Basic IndexedDb operations like:
 * - open a database
 * - get a value
 * - set a value
 */

export interface ICacheDB {
  db: IDBDatabase | null;
  storeName: string;
}

export async function openDatabase(
  dbName: string,
  storeName: string,
  version: number = 1
): Promise<ICacheDB> {
  // Indexeddb not supported
  if (!indexedDB && !window.indexedDB)
    return {
      db: null,
      storeName: storeName,
    };
  const db = indexedDB.open(dbName, version);
  return new Promise((resolve, reject) => {
    db.onupgradeneeded = (ev) => {
      // @ts-ignore
      const db: IDBDatabase = ev.target.result;

      const store = db.createObjectStore(storeName);

      store.transaction.oncomplete = () =>
        resolve({
          db,
          storeName,
        });
    };

    db.onerror = (ev) => {
      // @ts-ignore
      reject(ev.target.errorCode);
    };

    db.onsuccess = (ev) => {
      if (ev && ev.target) {
        resolve({
          // @ts-ignore
          db: ev.target.result,
          storeName,
        });
      }
    };
  });
}

export async function get<T>(cacheDb: ICacheDB, key: string): Promise<T | null> {
  const request = getObjectStore(cacheDb)?.get(key);

  return new Promise((resolve, reject) => {
    if (!request) return resolve(null);
    // @ts-ignore
    request.onerror = (ev) => reject(ev.target.errorCode);

    // @ts-ignore
    request.onsuccess = (ev) => resolve(ev.target.result);
  });
}

export async function set<T>(
  cacheDb: ICacheDB,
  key: string,
  value: T
): Promise<string> {
  const request = getObjectStore(cacheDb)?.put(value, key);

  return new Promise((resolve, reject) => {
    if (!request) return reject(Error('Request failed'));
    // @ts-ignore
    request.onerror = (ev) => reject(ev.target.errorCode);

    // @ts-ignore
    request.onsuccess = (ev) => resolve(ev.target.result);
  });
}

export async function remove(cacheDb: ICacheDB, key: string): Promise<void> {
  const request = getObjectStore(cacheDb)?.delete(key);

  return new Promise((resolve, reject) => {
    if (!request) return reject(Error('Request failed'));
    // @ts-ignore
    request.onerror = (ev) => reject(ev.target.errorCode);

    request.onsuccess = (ev) => resolve();
  });
}

export async function getAllKeys(cacheDb: ICacheDB): Promise<string[]> {
  const request = getObjectStore(cacheDb)?.getAllKeys();

  return new Promise((resolve, reject) => {
    if (!request) return reject(Error('Request failed'));
    // @ts-ignore
    request.onerror = (ev) => reject(ev.target.errorCode);

    // @ts-ignore
    request.onsuccess = (ev) => resolve(ev.target.result);
  });
}

function getObjectStore(cacheDb: ICacheDB): IDBObjectStore | null {
  const { db, storeName } = cacheDb;
  if (!db) return null;
  return db.transaction(storeName, "readwrite").objectStore(storeName);
}
