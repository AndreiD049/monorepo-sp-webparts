import { TimelinePipe } from '@pnp/core';
import { op, Queryable } from '@pnp/queryable';
import { CacheController } from './cache-controller';
import { ICacherConfig } from './cacher-config';
import { IClientStorage } from './IClientStorage';
import { IndexedDbClientStorage } from './indexeddb-client-storage';
import { LocalClientStorage } from './local-client-storage';
import { MemoryClientStorage } from './memory-client-storage';

export function IndexedDBCacher(config?: ICacherConfig) {
    /**
     * Test database health.
     * Check if you can create a database, then if you can create a store
     * if error: use fallback if provided, if now, throw an error
     */
    let storage: IClientStorage = new IndexedDbClientStorage();
    let Cache = new CacheController(storage, {
        ...config
    });
    // Fallback to Local
    storage.test().then(passed => {
        if (!passed) {
            storage = new LocalClientStorage();
            Cache.setStorage(storage);
            // Fallback to Memory storage
            storage.test().then(passed => {
                if (!passed) {
                    storage = new MemoryClientStorage();
                    Cache.setStorage(storage);
                }
            })
        }
    });

    const CachingTimeline: TimelinePipe<any> = async (instance: Queryable) => {
        // @ts-ignore
        instance.on.pre(async function (this: Queryable, url, init: RequestInit, result) {
            // @ts-ignore only cache get requested data or where the CacheAlways header is present (allows caching of POST requests)
            if (/get/i.test(init.method!) || init?.headers['X-PnP-CacheAlways']) {

                const proxy = Cache.get(url);
                const cached = await proxy.value();

                // we need to ensure that result stays "undefined" unless we mean to set null as the result
                if (cached === null) {

                    // if we don't have a cached result we need to get it after the request is sent and parsed
                    this.on.post(async function (url: URL, result: any) {
                        // cached the value
                        await proxy.set(result);

                        return [url, result];
                    });

                } else {

                    result = cached;
                }
            }
            return [url, init, result];
        });
        return instance;
    };

    return {
        Cache,
        CachingTimeline,
    };
}
