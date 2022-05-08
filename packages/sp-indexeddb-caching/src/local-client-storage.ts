import { IClientStorage } from "./IClientStorage";

export class LocalClientStorage implements IClientStorage {
    private _store: Storage;
    public type: 'index' | 'local' | 'memory' = 'local';

    constructor() {
        this._store = window.localStorage;
    }

    async has(key: string): Promise<boolean> {
        return this._store.getItem(key) !== null;
    }

    async get(key: string): Promise<string | null> {
        return this._store.getItem(key);
    }

    async set(key: string, val: string): Promise<void> {
        return this._store?.setItem(key, val);
    }

    async remove(key: string): Promise<void> {
        return this._store.removeItem(key);
    }

    async test(): Promise<boolean> {
        try {
            if (this._store === undefined) {
                return false;
            }
            const key = 't';
            this._store.setItem(key, key);
            this._store.getItem(key);
            this._store.removeItem(key);
            return true;
        } catch {
            return false;
        }
    }
}