
import { IClientStorage } from "./IClientStorage";

function onUpgradeNeeded(ev: IDBVersionChangeEvent) {
    // @ts-ignore
    const db: IDBDatabase = ev.target.result;
    db.createObjectStore(IndexedDbClientStorage.storeName);
}

async function openDb(name: string): Promise<IDBDatabase> {
    const request = window.indexedDB.open(name, 1);
    request.onupgradeneeded = onUpgradeNeeded;
    return new Promise((resolve, reject) => {
        request.onerror = (ev) => reject(ev);
        // @ts-ignore
        request.onsuccess = (ev) => resolve(ev.target.result);
    })
}

export class IndexedDbClientStorage implements IClientStorage {
    public static dbName: string = "SPFx_cache";
    public static storeName: string = "Cache";
    public type: 'index' | 'local' | 'memory' = 'index';

    constructor() {
    }

    async get(key: string): Promise<string | null> {
        const db = await openDb(IndexedDbClientStorage.dbName);
        return new Promise((resolve) => {
            const transaction = db.transaction(IndexedDbClientStorage.storeName, 'readonly');
            const os = transaction.objectStore(IndexedDbClientStorage.storeName);
            const readRequest = os.get(key);
            readRequest.onsuccess = (ev) => {
                // @ts-ignore
                resolve(ev.target.result || null)
            }
        });
    }

    async set(key: string, val: string): Promise<void> {
        const db = await openDb(IndexedDbClientStorage.dbName);
        return new Promise((resolve) => {
            const transaction = db.transaction(IndexedDbClientStorage.storeName, 'readwrite');
            const os = transaction.objectStore(IndexedDbClientStorage.storeName);
            const readRequest = os.put(val, key);
            readRequest.onsuccess = (ev) => { resolve() }
        });
    }

    async remove(key: string): Promise<void> {
        const db = await openDb(IndexedDbClientStorage.dbName);
        return new Promise((resolve) => {
            const transaction = db.transaction(IndexedDbClientStorage.storeName, 'readwrite');
            const os = transaction.objectStore(IndexedDbClientStorage.storeName);
            const readRequest = os.delete(key);
            readRequest.onsuccess = (ev) => { resolve() }
        });
    }

    async has(key: string): Promise<boolean> {
        const db = await openDb(IndexedDbClientStorage.dbName);
        return new Promise((resolve) => {
            const request = db.transaction(IndexedDbClientStorage.storeName, 'readwrite')
                .objectStore(IndexedDbClientStorage.storeName)
                .getKey(key)
            request.onsuccess = (ev) => { 
                // @ts-ignore
                const key = ev.target.result;
                if (key) {
                    resolve(true);
                } else {
                    resolve(false);
                }
            }
        });
    }

    async test(): Promise<boolean> {
        try {
            const indexedDB = window.indexedDB;
            if (!indexedDB) return false;
            return new Promise((resolve, reject) => {
                const request = indexedDB.open(IndexedDbClientStorage.dbName, 1);
                request.onupgradeneeded = onUpgradeNeeded;
                request.onerror = () => resolve(false)
                request.onsuccess = (ev) => {
                    // @ts-ignore
                    const db: IDBDatabase = ev.target.result
                    const transaction = db.transaction(IndexedDbClientStorage.storeName, 'readwrite');
                    const os = transaction.objectStore(IndexedDbClientStorage.storeName);
                    const request = os.add('test', 'test');
                    request.onerror = () => resolve(false);
                    request.onsuccess = () => {
                        const deleteRequest = os.delete('test');
                        deleteRequest.onsuccess = () => resolve(true);
                        deleteRequest.onerror = () => resolve(false);
                    }
                }
            });
        } catch {
            return false;
        }
    }

}