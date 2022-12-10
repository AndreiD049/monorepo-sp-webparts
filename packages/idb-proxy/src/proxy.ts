import { getCached, setCached } from "./cache-operations";
import { ICacheDB, openDatabase } from "./db-operations";

type PropertyOptions = {
  isCached?: boolean;
  expiresIn?: number;
  after?: (db: ICacheDB, args: any[], returnValue: any) => Promise<void>;
};

type ICacheProxyProperties<T> = {
  [property in keyof T]?: PropertyOptions;
} | { [property in Exclude<string, keyof T>]: PropertyOptions & { isPattern: boolean } };

interface ICacheProxyOptions<T> {
  dbName: string;
  storeName: string;
  props: ICacheProxyProperties<T>;
}

function validateAsyncTargetProperty<T extends { [k: string]: any }>(
  target: T,
  property: string
) {
  if (!(property in target)) return false;
  if (typeof target[property] !== "function") return false;
  // Only for async functions
  if (target[property].constructor.name !== "AsyncFunction") return false;
  return true;
}

function findValidPropertyOptions(
  property: string,
  propertyOptions: ICacheProxyProperties<any>
) {
  for (const key in propertyOptions) {
    if (Object.prototype.hasOwnProperty.call(propertyOptions, key)) {
      // @ts-ignore
      const option = propertyOptions[key];
      if (option.isPattern) {
        const pattern = new RegExp(key);
        if (pattern.test(property)) {
          return option;
        }
      } else if (property === key) {
        return option;
      }
    }
  }
  return null;
}

export function createCacheProxy<T extends { [k: string]: any }>(
  target: T,
  options: ICacheProxyOptions<T>
): T {
  const handler = {
    get: (target: T, property: string) => {
      const propertyOpts = findValidPropertyOptions(property, options.props);
      if (validateAsyncTargetProperty(target, property) && propertyOpts) {
        return propertyOpts.isCached
          ? cachedHandler(target, property, options, propertyOpts)
          : nonCachedHandler(target, property, options, propertyOpts);
      } else {
        return target[property];
      }
    },
  };
  return new Proxy(target, handler);
}

function cachedHandler<T extends { [k: string]: any }>(
  target: T,
  property: string,
  options: ICacheProxyOptions<T>,
  propertyOption: PropertyOptions
) {
  return async (...args: any[]) => {
    // Open the database
    const db = await openDatabase(options.dbName, options.storeName);

    // Calculate the key
    const key = `${property}${args.reduce(
      (acc, current) => `${acc}/${JSON.stringify(current)}`,
      ""
    )}`;

    // See if we have any valid cache value, and return it
    const cached = await getCached(db, key);
    if (cached !== null) {
      propertyOption.after && propertyOption.after(db, args, cached);
      return cached;
    }

    // Get a fresh value and store it into cache, then return to the user
    const freshValue = await target[property](...args);
    if (!propertyOption.expiresIn) {
      throw Error('\'expiresIn\' should be provided for cached properties!');
    }
    await setCached(db, key, freshValue, propertyOption.expiresIn);
    propertyOption.after && propertyOption.after(db, args, freshValue);
    return freshValue;
  };
}

function nonCachedHandler<T extends { [k: string]: any }>(
  target: T,
  property: string,
  options: ICacheProxyOptions<T>,
  propertyOption: PropertyOptions
) {
  return async (...args: any[]) => {
    const result = await target[property](...args);
    if (propertyOption.after) {
      // Open the database
      const db = await openDatabase(options.dbName, options.storeName);
      await propertyOption.after(db, args, result);
    }
    return result;
  };
}
