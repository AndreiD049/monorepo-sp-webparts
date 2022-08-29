import { getValue, hasKey, openDB, removeValue, setValue } from "./utils";

export default class IndexedDb {
    private static dbName: string;
    private static storeName: string;
    private static db: IDBDatabase;

    public static async Init(dbName: string, storeName: string) {
        this.dbName = dbName;
        this.storeName = storeName;
        this.db = await openDB(dbName, storeName);
        this.db.onclose = async () => {
            this.db = await openDB(dbName, storeName);
        }
    }

    public static async Set<T>(key: string, value: T) {
        return setValue(this.db, this.storeName, value, key);
    }

    public static async Get<T>(key: string): Promise<T | null> {
        return getValue<T>(this.db, this.storeName, key);
    }

    public static async Remove(key: string) {
        return removeValue(this.db, this.storeName, key);
    }

    public static async HasKey(key: string) {
        return hasKey(this.db, this.storeName, key);
    }

    test() {
        if (!('indexedDb' in window)) {
            throw Error('IndexedDb is not supported');
        }
    }
}