import { IndexedDbCache } from 'indexeddb-manual-cache';
import { DB_NAME, STORE_NAME, HOUR } from './constants';
import CipWebPart from '../CipWebPart';

const db = new IndexedDbCache(DB_NAME, STORE_NAME, {
    expiresIn: HOUR * 24,
});

export const getListId = async (name: string): Promise<string> => {
    const sp = CipWebPart.SPBuilder.getSP('Data');

    return db.getCached('getListId', async () => (await sp.web.lists.getByTitle(name).select('Id')()).Id);
};
