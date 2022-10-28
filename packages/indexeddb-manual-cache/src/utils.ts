export interface ICachedValue<T> {
  expires: number;
  value: T;
}

export interface ICacheOptions {
  expiresIn: number;
}

export function isExpired(value: ICachedValue<any>) {
  return value.expires <= Date.now();
}

function getOnUpgradeNeeded(storeName: string) {
  return function (this: IDBOpenDBRequest, ev: IDBVersionChangeEvent) {
    const db = this.result;
    db.createObjectStore(storeName);
  };
}

export async function openDB(
  name: string,
  storeName: string,
  version?: number
): Promise<IDBDatabase> {
  const request = window.indexedDB.open(name, version);
  request.onupgradeneeded = getOnUpgradeNeeded(storeName);
  return new Promise((resolve, reject) => {
    request.onerror = function (ev) {
      return reject(ev);
    };
    request.onsuccess = async function (_ev) {
      const db = this.result;
      if (!db.objectStoreNames.contains(storeName) && !version) {
        db.close();
        return resolve(await openDB(name, storeName, db.version + 1));
      }
      return resolve(db);
    };
  });
}

export async function setValue<T>(
  dbName: string,
  storeName: string,
  val: T,
  key: string
): Promise<void> {
  let db = await openDB(dbName, storeName);
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, "readwrite");
    const os = transaction.objectStore(storeName);
    const writeRequest = os.put(val, key);
    writeRequest.onsuccess = () => resolve();
    writeRequest.onerror = () =>
      reject(Error("Cound't write value to indexeddb"));
  });
}

export async function getValue<T>(
  dbName: string,
  storeName: string,
  key: string
): Promise<T | null> {
  let db = await openDB(dbName, storeName);
  return new Promise((resolve) => {
    const transaction = db.transaction(storeName, "readonly");
    const os = transaction.objectStore(storeName);
    const getRequest = os.get(key);
    getRequest.onsuccess = function () {
      resolve((this.result as T) || null);
    };
    getRequest.onerror = function () {
        resolve(null);
    }
  });
}

export async function removeValue(
  dbName: string,
  storeName: string,
  key: string
): Promise<boolean> {
  let db = await openDB(dbName, storeName);
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, "readwrite");
    const os = transaction.objectStore(storeName);
    const removeRequest = os.delete(key);
    removeRequest.onsuccess = function () {
      resolve(true);
    };
    removeRequest.onerror = function () {
      reject(false);
    };
  });
}

export async function getAllKeys(
    dbName: string,
    storeName: string,
): Promise<IDBValidKey[]> {
    let db = await openDB(dbName, storeName);
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, "readwrite");
        const os = transaction.objectStore(storeName);
        const letRequest = os.getAllKeys();
        letRequest.onsuccess = function () {
            resolve(this.result);
        }
        letRequest.onerror = function () {
            reject(Error('Coundn\'t get all keys'));
        }
    });
}
