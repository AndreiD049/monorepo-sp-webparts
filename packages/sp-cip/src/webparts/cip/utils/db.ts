import { IndexedDbCache } from "indexeddb-manual-cache";
import { DB_NAME, HOUR, STORE_NAME } from "./constants";

export const db = new IndexedDbCache(DB_NAME, STORE_NAME, {
    expiresIn: HOUR,
});
