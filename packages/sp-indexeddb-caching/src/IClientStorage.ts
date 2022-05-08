export interface IClientStorage {
    type: 'index'|'local'|'memory';
    /**
     * @param key key by which we can find the cached value
     * @returns the first cached value that matches this key
     * returns null if value not cached
     */
    get(key: string): Promise<any | null>;

    /**
     * Set the value, similar to react useState action
     * @param val Value, or function which get's the previously cached value as an argument
     */
    set(key: string, val: any): Promise<void>;

    /**
     * Remove the matching key from the cache
     * @param key the key to be removed
     */
    remove(key: string): Promise<void>;

    /**
     * Checks whether value is in storage
     * @param key key to be checked
     */
    has(key: string): Promise<boolean>;

    /**
     * Asserts whether this type of storage is available in user's context
     */
    test(): Promise<boolean>;
}