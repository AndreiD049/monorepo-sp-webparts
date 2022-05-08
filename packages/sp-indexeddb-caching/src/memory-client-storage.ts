import { IClientStorage } from "./IClientStorage";

export class MemoryClientStorage implements IClientStorage {
    private _store: Map<string, string>;
    public type: 'index' | 'local' | 'memory' = 'memory';

    constructor() {
        this._store = new Map();
    }

    async has(key: string): Promise<boolean> {
        return this._store.has(key);
    }

    async get(key: string): Promise<string | null> {
        return this._store.has(key) ? this._store.get(key)! : null;
    }

    async set(key: string, val: string): Promise<void> {
        this._store.set(key, val);
    }

    async remove(key: string): Promise<void> {
        this._store.delete(key);
    }

    async test(): Promise<boolean> {
        try {
            if (!this._store) {
                return false;
            }
            const k = 't';
            this._store.set(k, k);
            this._store.get(k);
            this._store.delete(k);
            return true;
        } catch {
            return false;
        }
    }

}