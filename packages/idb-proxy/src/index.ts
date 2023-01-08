export { createCacheProxy, ICacheProxyOptions } from "./proxy";

export { openDatabase } from './db-operations';

export {
  getCached,
  setCached,
  removeCached,
  removeExpired,
  updateCached,
} from "./cache-operations";
