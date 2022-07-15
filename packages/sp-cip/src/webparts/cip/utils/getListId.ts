import { IndexedDBCacher } from "sp-indexeddb-caching";
import CipWebPart from "../CipWebPart";


export const getListId = async (name: string): Promise<string> => {
    const caching = IndexedDBCacher({
        expireFunction: () => new Date(Date.now() + 1000 * 60 * 60 * 24),
    });
    const sp = CipWebPart.SPBuilder.getSP('Data').using(caching.CachingTimeline);

    return (await sp.web.lists.getByTitle(name).select('Id')()).Id;
}
