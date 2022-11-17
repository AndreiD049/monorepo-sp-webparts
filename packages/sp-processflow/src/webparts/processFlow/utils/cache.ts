import { IndexedDbCache } from "indexeddb-manual-cache";

const DBNAME = `SPFX_ProcessFlow`;
const STORENAME = `${location.origin} + ${location.pathname}`

export const db = new IndexedDbCache(DBNAME, STORENAME, {
    expiresIn: 1000 * 60 * 15,
});
