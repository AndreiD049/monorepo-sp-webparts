import IndexedDb from "./IndexedDb";
import { ICachedValue, isExpired } from "./utils";

export type GetterFunction<T> = () => T;

export async function Cached<T>(key: string, getter: GetterFunction<T>) {
    let value = await IndexedDb.Get<ICachedValue<T>>(key);
    if (!value || isExpired(value)) {
        const value = await getter();
        await IndexedDb.Set(key, value);
    }
    return value;
}