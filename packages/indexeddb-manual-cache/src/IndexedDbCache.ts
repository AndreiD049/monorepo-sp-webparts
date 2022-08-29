import { getValue, ICachedValue, ICacheOptions, isExpired, removeValue, setValue } from "./utils";

export type KeyAccessor = {
    get: <T>(getter: () => T) => Promise<T>;
    update: <T>(setter: (prev: T) => T) => Promise<T>;
    remove: () => Promise<boolean>;
}

export default class IndexedDbCache {
    constructor(private dbName: string, private storeName: string, private config: ICacheOptions) {
        this.test();
    }

    public key(key: string) {
        return {
            get: <T>(getter: () => T) => this.getCached(key, getter),
            update: <T>(setter: (prev: T) => T) => this.updateCached(key, setter),
            remove: () => this.remove(key),
        }
    }

    /**
     * Try to get the cached value.
     * If it doesn't exist, or is expired, call the getter and cache the new value.
     * Else, just return the cached value
     */
    public async getCached<T>(key: string, getter: () => T): Promise<T> {
        const cachedValue = await this.get<T>(key);
        if (!cachedValue || isExpired(cachedValue)) {
            const newValue = await getter();
            await this.set(key, {
                expires: Date.now() + this.config.expiresIn,
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

    private async set(key: string, value: ICachedValue<any>) {
        return setValue(this.dbName, this.storeName, value, key);
    }

    private async get<T>(key: string): Promise<ICachedValue<T> | null> {
        return await getValue<ICachedValue<T>>(this.dbName, this.storeName, key);
    }

    private async remove(key: string) {
        return removeValue(this.dbName, this.storeName, key);
    }

    private test() {
        if (!('indexedDB' in window)) {
            throw Error('IndexedDb is not supported');
        }
    }
}