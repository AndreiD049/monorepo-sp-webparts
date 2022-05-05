import { TimelinePipe } from '@pnp/core';
import { Queryable } from '@pnp/queryable';
import { ICacherConfig } from './cacher-config';

export function IndexedDBCacher(config?: ICacherConfig) {
    /**
     * Test database health.
     * Check if you can create a database, then if you can create a store
     * if error: use fallback if provided, if now, throw an error
     */
    const CachingTimeline: TimelinePipe<any> = async (instance: Queryable) => {
        instance.on.pre(async (url, init, result) => {
            /**
             * Check how it's done in the pnpjs package: https://github.com/pnp/pnpjs/blob/a9b15c4a8f517d99a14e626f2494bd8549435536/packages/queryable/behaviors/caching.ts
             * Steps to be done here:
             * check if url in cache
             * if yes: check if cache not expired
             */
            return [url, init, result]
        });
        return instance;
    };
    return {
        CachingTimeline,
    }
}