import { IClientStorage } from './IClientStorage';
import { getHashCode } from './utils';

export const defaultExpiry = () => new Date(Date.now() + 1000 * 60 * 5);
export const defaultKeyFactory = (url: string) => getHashCode(url).toString();

export interface ICachedValue<T> {
    expiration: number;
    value: T;
}

export interface ICacheValueProxy {
    value<T>(): Promise<T | null>;
    set<T>(v: (prev: T) => T, valueIfNull?: T | null): Promise<void>;
    set<T>(v: T): Promise<void>;
    remove(): Promise<void>;
}

export class CachedValueProxy implements ICacheValueProxy {
    private hashKey: string;
    private options: {
        expireFunc: () => Date;
        keyFactory: (url: string) => string;
    };

    constructor(
        private storage: IClientStorage,
        private absoluteUrl: string,
        options?: {
            expireFunc?: () => Date;
            keyFactory?: (url: string) => string
        }
    ) {
        this.options = {
            expireFunc: defaultExpiry,
            keyFactory: defaultKeyFactory,
            ...options,
        };
        this.hashKey = this.options.keyFactory(this.absoluteUrl);
    }

    async value<T>(): Promise<T | null> {
        const cachedValue = await this.storage.get(this.hashKey);
        const result = this.deserialize<T>(cachedValue);
        if (result === null || this.isExpired(result)) {
            this.storage.remove(this.hashKey);
            return null;
        }
        return result.value;
    }

    async set<T extends string | number | object>(v: T | ((prev: T) => T), valueIfNull: T | null = null): Promise<void> {
        if (typeof v === 'function') {
            const prev = await this.value<T>();
            if (prev === null) {
                this.storage.set(this.hashKey, this.wrapAndSerialize(valueIfNull));
            } else {
                this.storage.set(this.hashKey, this.wrapAndSerialize(v(prev)))
            }
        } else {
            await this.storage.set(this.hashKey, this.wrapAndSerialize(v));
        }
    }

    async remove(): Promise<void> {
        await this.storage.remove(this.hashKey);
    }

    private isExpired(value: ICachedValue<any>): boolean {
        return value.expiration < Date.now();
    }

    private deserialize<T>(val: string | null): ICachedValue<T> | null {
        try {
            if (val === null) return null;
            return this.storage.type === 'index' ? val : JSON.parse(val);
        } catch {
            return null;
        }
    }

    private wrapAndSerialize<T>(v: T): string | ICachedValue<T> {
        const cachedValue: ICachedValue<T> = {
            expiration: this.options.expireFunc().getTime(),
            value: v,
        };
        return this.storage.type === 'index' ? cachedValue : JSON.stringify(cachedValue);
    }
}

export interface ICacheControllerOptions {
    expireFunc?: () => Date;
    keyFactory?: (url: string) => string;
}

export class CacheController {
    private ProxyPull: Map<string, CachedValueProxy>;
    private options: ICacheControllerOptions;

    constructor(
        private clientStorage: IClientStorage,
        options: ICacheControllerOptions = {},
    ) {
        this.ProxyPull = new Map();
        this.options = {
            expireFunc: defaultExpiry,
            keyFactory: defaultKeyFactory,
            ...options,
        };
    }

    setStorage(storage: IClientStorage) {
        this.clientStorage = storage;
    }

    get(absoluteUrl: string): CachedValueProxy {
        if (this.ProxyPull.has(absoluteUrl)) {
            return this.ProxyPull.get(absoluteUrl)!;
        }
        this.ProxyPull.set(
            absoluteUrl,
            new CachedValueProxy(
                this.clientStorage,
                absoluteUrl,
                this.options
            )
        );
        return this.ProxyPull.get(absoluteUrl)!;
    }

    /**
     * Get the cached proxy from parts of url
     * @param baseUrl Base site url: example `https://contoso.sharepoint.com/sites/my-site`
     * @param requestUrl Url of the api request: example: `_api/web/lists`
     * @returns Cached value proxy
     */
    getFromParts(baseUrl: string, requestUrl: string) {
        if (baseUrl[baseUrl.length - 1] !== '/') {
            baseUrl += '/';
        }
        return this.get(baseUrl + requestUrl);
    }
}
