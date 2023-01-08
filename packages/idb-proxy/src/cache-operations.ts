/**
 * Author: Andrei Dimitrascu 
 * =================================
 * Simple cache operations like:
 * - Set cached value with expiration date at a certain timestamp
 * - Get cached value if it's not expired etc
 */

import { get, getAllKeys, ICacheDB, remove, set } from "./db-operations";

export interface ICachedValue<T> {
    expiresAt: number;
    value: T;
}

function createCachedValue<T>(value: T, expiresIn: number): ICachedValue<T> {
    return {
        expiresAt: Date.now() + expiresIn,
        value,
    }
}

function isValueExpired(value: ICachedValue<any>): boolean {
    return value.expiresAt < Date.now();
}

export async function setCached<T>(db: ICacheDB, key: string, value: T, expiresIn: number): Promise<string> {
    const cachedValue = createCachedValue(value, expiresIn);
    return set(db, key, cachedValue);
}

export async function getCached<T>(db: ICacheDB, key: string): Promise<T | null> {
    const dbRecord = await get<ICachedValue<T>>(db, key);
    if (!dbRecord) return null;
    if (dbRecord.expiresAt && !isValueExpired(dbRecord)) {
        return dbRecord.value;
    } else {
        await remove(db, key);
        return null;
    }
}

export async function removeExpired(db: ICacheDB): Promise<void> {
    const keys = await getAllKeys(db);
    for (const key of keys) {
        const value = await get<ICachedValue<any>>(db, key);
        if (value && isValueExpired(value)) {
            await removeCached(db, key);
        }
    }
}

export async function removeCached(db: ICacheDB, key: string | RegExp): Promise<void> {
    if (typeof key === 'string') {
        // if key is a string, just remove this same key
        await remove(db, key);
    } else {
        // if key is a regexp, remove all keys that match it
        const keys = await getAllKeys(db);
        const keysToRemove = keys.filter((k) => key.test(k));
        await Promise.all(keysToRemove.map(async (k) => remove(db, k)))
    }
}

export async function updateCached(db: ICacheDB, key: string | RegExp, update: (value: any, key: string) => any): Promise<string|string[]> {
    if (typeof key === 'string') {
        // if key is a string, update this single value
        const currentValue = await get<ICachedValue<any>>(db, key);
        if (currentValue) {
            return set(db, key, {
                ...currentValue,
                value: update(currentValue.value, key)
            });
        }
        return '';
    } else {
        // if key is a regex, get all matching keys
        const keys = await getAllKeys(db);
        const keysToUpdate = keys.filter((k) => key.test(k));
        return Promise.all(keysToUpdate.map(async (k) => {
            const cachedItem = await get<ICachedValue<any>>(db, k);
            if (cachedItem) {
                return set(db, k, {
                    ...cachedItem,
                    value: update(cachedItem.value, k)
                });
            }
            return '';
        }))
    }
}
