import 'fake-indexeddb/auto';
import { getCached, removeCached, setCached, updateCached } from '../src/cache-operations';
import { openDatabase, set, get, getAllKeys } from '../src/db-operations';
import { createCacheProxy } from '../src/proxy';

const DB_NAME = 'test-db';
const STORE_NAME = 'test-store';

class testService {
    async getUser(id: number) {
        return ({
            id,
            name: `User${id}`,
        });
    }

    async getTask(id: number, user: string) {
        return ({
            id,
            task: `Task - ${id}`,
            user: user,
        });
    }

    async updateUser(id: number, payload: any) {
        return true;
    }
};

it('Opening a database should return a valid db', async () => {
    const db = await openDatabase(DB_NAME, STORE_NAME);
    await set(db, 'test', 'value');
})

it('cached proxy', async () => {
    const serv = createCacheProxy(new testService(), {
        dbName: DB_NAME,
        storeName: STORE_NAME,
        props: {
            "get.*": {
                isCached: true,
                isPattern: true,
                expiresIn: 1000,
            },
            'updateUser': {
                after: async (db, args) => {
                    const userId = args[0];
                    const payload = args[1];
                    await updateCached(db, new RegExp(`getUser.*${userId}`), (old) => ({
                        ...old,
                        ...payload,
                    }));
                }
            }
        }
    });
    console.log(await serv.getUser(10));
    console.log(await serv.getUser(10));
    console.log(await serv.updateUser(10, {
        name: 'andrei',
    }));
    console.log(await serv.getUser(10));
})