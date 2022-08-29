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
    }
}

export async function openDB(name: string, storeName: string): Promise<IDBDatabase> {
    const request = window.indexedDB.open(name, 1);
    request.onupgradeneeded = getOnUpgradeNeeded(storeName);
    return new Promise((resolve, reject) => {
        request.onerror = function (ev) {return reject(ev) };
        request.onsuccess = function (_ev) { return resolve(this.result) };
    })
}

export async function setValue<T>(db: IDBDatabase, storeName: string, val: T, key: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readwrite');
        const os = transaction.objectStore(storeName);
        const writeRequest = os.put(val, key);
        writeRequest.onsuccess = () => resolve();
        writeRequest.onerror = (ev) => reject(Error('Cound\'t write value to indexeddb'));
    });
}

export async function getValue<T>(db: IDBDatabase, storeName: string, key: string): Promise<T | null> {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readonly');
        const os = transaction.objectStore(storeName);
        const getRequest = os.get(key);
        getRequest.onsuccess = function () { resolve(this.result as T || null) }
    });
}

export async function removeValue(db: IDBDatabase, storeName: string, key: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readwrite');
        const os = transaction.objectStore(storeName);
        const removeRequest = os.delete(key);
        removeRequest.onsuccess = function () { resolve(true) }
        removeRequest.onerror = function () { reject(false) }
    });
}

export async function hasKey(db: IDBDatabase, storeName: string, key: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readwrite');
        const os = transaction.objectStore(storeName);
        const getRequest = os.getKey(key);
        getRequest.onsuccess = function () { resolve(Boolean (this.result)) }; 
        getRequest.onerror = () => reject(false);
    });
}