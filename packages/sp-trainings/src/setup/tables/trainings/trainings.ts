import { SPFI } from "sp-preset";

export async function ensureTable(name: string, sp: SPFI) {
    const result = await sp.web.lists.ensure(name);
    return result.list;
}