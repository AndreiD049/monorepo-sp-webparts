import { DB_NAME, STORE_NAME, HOUR } from '../utils/constants';
import CipWebPart from '../CipWebPart';
import { createCacheProxy } from 'idb-proxy';

const listUtils = {
    getListId: async (name: string): Promise<string> => {
        const sp = CipWebPart.SPBuilder.getSP('Data');

        return (await sp.web.lists.getByTitle(name).select('Id')()).Id;
    }
}

export const ListUtilsService =  createCacheProxy(listUtils, {
    dbName: DB_NAME,
    storeName: STORE_NAME,
    prefix: 'listUtils',
    props: {
        getListId: {
            isCached: true,
            expiresIn: HOUR * 24
        }
    }
})