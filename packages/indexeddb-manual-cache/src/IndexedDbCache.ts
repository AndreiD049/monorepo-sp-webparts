import { getAllKeys, getValue, ICachedValue, ICacheOptions, isExpired, removeValue, setValue } from "./utils";

export type KeyAccessor = {
    get: <T>(getter: () => T, expiresIn?: number) => Promise<T>;
    update: <T>(setter: (prev: T) => T) => Promise<T | null>;
    remove: () => Promise<boolean | null>;
}

export default class IndexedDbCache {
    constructor(private dbName: string, private storeName: string, private config: ICacheOptions) {
        this.test();
    }

    public key(key: string): KeyAccessor {
        return {
            get: <T>(getter: () => T, expiresIn?: number) => this.getCached(key, getter, expiresIn),
            update: <T>(setter: (prev: T) => T) => this.updateCached(key, setter),
            remove: () => this.remove(key),
        }
    }

    /**
     * Try to get the cached value.
     * If it doesn't exist, or is expired, call the getter and cache the new value.
     * Else, just return the cached value
     */
    public async getCached<T>(key: string, getter: () => T, expiresIn?: number): Promise<T> {
        if (this.config.expiresIn === 0) {
            return getter();
        }
        const cachedValue = await this.get<T>(key);
        if (!cachedValue || isExpired(cachedValue)) {
            const newValue = await getter();
            await this.set(key, {
                expires: Date.now() + (expiresIn || this.config.expiresIn),
                value: newValue,
            });
            return newValue;
        }
        return cachedValue.value;
    }

    /**
     * Update the value in the cache
     * Don't update the expiry date
     */
    public async updateCached<T>(key: string, setter: (prev: T) => T) {
        if (this.config.expiresIn === 0) {
            return null;
        }
        const value = await this.get<T>(key);
        if (!value || isExpired(value)) {
            return null;
        }
        const newValue = await setter(value.value);
        await this.set(key, {
            expires: value.expires,
            value: newValue,
        });
        return newValue;
    }

    public async invalidateCached(key: string) {
        await this.remove(key);
    }

    public async getAllKeys(): Promise<IDBValidKey[]> {
        return getAllKeys(this.dbName, this.storeName);
    }

    /**
     * Returns whether key is expired.
     * If key doesn't exist, returns null
     */
    public async isExpired(key: string): Promise<boolean | null> {
        const cachedValue = await this.get<any>(key);
        return cachedValue ? isExpired(cachedValue) : null;
    }

    private async set(key: string, value: ICachedValue<any>) {
        return setValue(this.dbName, this.storeName, value, key);
    }

    private async get<T>(key: string): Promise<ICachedValue<T> | null> {
        return await getValue<ICachedValue<T>>(this.dbName, this.storeName, key);
    }

    private async remove(key: string) {
        if (this.config.expiresIn === 0) {
            return null;
        }
        return removeValue(this.dbName, this.storeName, key);
    }

    private test() {
        if (!('indexedDB' in window)) {
            throw Error('IndexedDb is not supported');
        }
    }
}
