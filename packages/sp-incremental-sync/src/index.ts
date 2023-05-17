import { IList } from '@pnp/sp/lists';
import { IDBPDatabase, openDB, deleteDB } from 'idb';

const NEXT_ATTR = 'ListItemCollectionPositionNext';
const COUNT_ATTR = 'ItemCount';
const TOKEN = 'LastChangeToken';
const MAX_REQUESTS = 100;

type ColumnType = 'Integer' | 'Float' | 'String' | 'Boolean' | 'Person' | 'MultiChoice';

export type ItemSchema = {
    [field: string]: {
        type: ColumnType;
        indexed?: boolean;
        keyPath?: string | string[];
        transform?: (value: any) => any;
    };
};

// How will i call this?
// const syncer = getSyncer(config);
// const data = await syncer.getData();

type ParsedResponce<T> = {
    deletedItems: string[];
    token: string;
    shouldResync: boolean;
    itemCount: number;
    nextToken: string;
    items: { [uniqueId: string]: T };
    moreChanges: boolean;
};

function mergeResponses<T>(
    responce1: ParsedResponce<T>,
    responce2: ParsedResponce<T>
) {
    responce1.deletedItems = [
        ...responce1.deletedItems,
        ...responce2.deletedItems,
    ];

    const keys = Object.keys(responce2.items);
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        responce1.items[key] = responce2.items[key];
    }
    responce1.itemCount += keys.length;
}

function parseResponce<T>(
    responceXML: string,
    schema: ItemSchema
): ParsedResponce<T> {
    // Default responce
    const result: ParsedResponce<T> = {
        deletedItems: [],
        token: '',
        shouldResync: false,
        nextToken: '',
        itemCount: 0,
        items: {},
        moreChanges: false,
    };

    const xml = new DOMParser().parseFromString(responceXML.trim(), 'text/xml');

    // Do we need to do a full resync?
    const changes = xml.querySelector('Changes');

    if (changes) {
        const hasInvalidToken =
            changes.querySelector('Id[ChangeType="InvalidToken"]') !== null;
        const hasResync =
            changes.querySelector('Id[ChangeType="Resync"]') !== null;

        if (hasInvalidToken || hasResync) {
            result.shouldResync = true;
            return result;
        }

        // Get the token
        result.token = changes.getAttribute(TOKEN) || '';

        const deletes = changes.querySelectorAll('Id[ChangeType="Delete"]');
        for (let i = 0; i < deletes.length; i++) {
            const element = deletes[i];
            const id = element.textContent;
            const uniqueId = element.getAttribute('UniqueId');
            result.deletedItems.push(id + ';#' + uniqueId);
        }

        // More changes
        result.moreChanges = changes.getAttribute('MoreChanges') === 'TRUE';
    }

    const data = xml.querySelector('data');
    if (data) {
        result.itemCount = parseInt(data.getAttribute(COUNT_ATTR) || '0');
        result.nextToken = (data.getAttribute(NEXT_ATTR) || '').replace(
            '&',
            '&amp;'
        );

        // Now parse the items
        const items = data.querySelectorAll('row');
        for (let i = 0; i < items.length; i++) {
            // Get the unique id that is the key for the object
            const el = items[i];
            const uniqueId = el.getAttribute('ows_UniqueId');

            // No unique id, skip
            if (!uniqueId) {
                console.warn('No unique id found for item', el);
                continue;
            }

            result.items[uniqueId] = parseItem(el, schema);
        }
    }

    return result;
}

function parseItem<T>(item: Element, schema: ItemSchema): T {
    const keys = Object.keys(schema);

    // Attributes, the same Keys, but with ows_ prefix
    const attributes = keys.map((key) => `ows_${key}`);

    const result: any = {};

    for (let i = 0; i < attributes.length; i++) {
        const attribute = attributes[i];
        const key = keys[i];
        const value = item.getAttribute(attribute);

        if (value) {
            result[key] = parseValue(value, schema[key].type);
            
            // does the value need transformation?
            const transform = schema[key].transform;
            if (transform) {
                result[key] = transform(result[key]);
            }
        }
    }

    return result as T;
}

function parseValue(value: string, type: ColumnType) {
    switch (type) {
        case 'Integer':
            return parseInt(value);
        case 'Float':
            return parseFloat(value);
        case 'Boolean':
            return value === '1';
        case 'Person':
            const [ID, rest] = value.split(';#');
            const [Title, LoginName, EMail] = rest.split(',#');
            return { ID: parseInt(ID), Title, LoginName, EMail };
        case 'MultiChoice':
            return value.split(';#').slice(1, -1);
        default:
            return value;
    }
}

// How do i want the user to call the api?
// const provider = getProvider(config);
//
// const data = await provider.getData();
//
// I can also forget the data to force a full resync
// provider.forget();
//
// I can also pass a filter function if i want
// await provider.getData((i) => i.Category === 'Some category');
//
// The data will be stored in IndexedDB
// I also need to be able to get the data by an arbitrary key (index)
// await provider.getDataByKey('UniqueId', '123');
//
// What info do i need to be able to open and store info in the
// database?

// Store for some heler data
// - when the last sync was
// - the token
// - the schema
export type StoreConfig = {
    list: IList;
    schema: ItemSchema;
    dbName: string;
    where?: string; // https://learn.microsoft.com/en-us/previous-versions/office/developer/sharepoint-2010/ms467521(v=office.14)#query-schema-elements
    rowLimit?: string;
    maxRequests?: number;
};

const META_STORE = 'meta_info';
const SCHEMA_KEY = 'schema';
const QUERY_KEY = 'query';
const DATA_STORE = 'data';
const MAX_ROWS = '100';

interface StoreProvider<T> {
    getData(): Promise<T[]>;

    // Get the data by a given key
    getDataByKey(key: string, value: any): Promise<T[]>;

    forget(): Promise<void>;
}

export class IDBStoreProvider<T> implements StoreProvider<T> {
    // private db: Promise<IDBPDatabase>;

    constructor(private config: StoreConfig) {
        this.config.rowLimit = this.config.rowLimit || MAX_ROWS;
        this.config.maxRequests = this.config.maxRequests || MAX_REQUESTS;
        this.config.where = this.config.where || '';
    }

    private openDatabase() {
        const self = this;
        return openDB(this.config.dbName, undefined, {
            async upgrade(database) {
                // Create the meta store
                const meta = database.createObjectStore(META_STORE);

                // Create the data store
                const data = database.createObjectStore(DATA_STORE);

                // Create the indexes for every
                const keys = Object.keys(self.config.schema);
                for (let i = 0; i < keys.length; i++) {
                    const key = keys[i];
                    const column = self.config.schema[key];
                    if (column.indexed) {
                        data.createIndex(key, column.keyPath || key);
                    }
                }
            },
            blocking(_currentVersion, _blockedVersion, event) {
                const db = event.target as IDBDatabase;
                db.close();
            },
        });
    }

    private async syncData(resync: boolean = false) {
        try {
            const list = this.config.list;
            const token = await this.getItem(META_STORE, TOKEN);

            const prevSchema: string = await this.getItem(
                META_STORE,
                SCHEMA_KEY
            );

            // If schema changed, should resync
            if (
                !resync &&
                prevSchema &&
                prevSchema !== serializeSchema(this.config.schema)
            ) {
                // delete the database and create a new one, since schema changed
                await this.forget();
                await this.syncData(true);
            }
            const responce = await list.getListItemChangesSinceToken({
                ChangeToken: token,
                Query: this.config.where || '',
                RowLimit: this.config.rowLimit,
            });
            
            const query = (await this.getItem(META_STORE, QUERY_KEY)) || '';
            // If query changed, should resync
            if (!resync && query !== this.config.where) {
                await this.forget();
                await this.syncData(true);
            }

            const parsed = parseResponce<T>(responce, this.config.schema);

            if (parsed.shouldResync && !resync) {
                await this.setItem(META_STORE, TOKEN, '')
                await this.syncData(true);
            }

            let nextToken = parsed.nextToken;
            let maxRequests = this.config.maxRequests || 0;
            for(let r = 0; r < maxRequests && nextToken; r++) {
                const nextBatch = await list.getListItemChangesSinceToken({
                    QueryOptions: `<QueryOptions><ExpandUserField>TRUE</ExpandUserField><Paging ListItemCollectionPositionNext="${nextToken}" /></QueryOptions>`,
                    Query: this.config.where || '',
                    RowLimit: this.config.rowLimit,
                });

                const newParsed = parseResponce<T>(
                    nextBatch,
                    this.config.schema
                );
                mergeResponses(parsed, newParsed);

                nextToken = newParsed.nextToken;
            }

            let moreChanges = parsed.moreChanges;
            for (let r = 0; r < maxRequests && moreChanges; r++) {
                const nextBatch = await list.getListItemChangesSinceToken({
                    ChangeToken: parsed.token,
                    Query: this.config.where || '',
                    RowLimit: this.config.rowLimit,
                });

                const newParsed = parseResponce<T>(
                    nextBatch,
                    this.config.schema
                );
                mergeResponses(parsed, newParsed);
                parsed.token = newParsed.token;
                moreChanges = newParsed.moreChanges;
            }

            for (let d = 0; d < parsed.deletedItems.length; d++) {
                const deletedId = parsed.deletedItems[d];
                await this.deleteDataItem(deletedId);
            }

            await this.setData(parsed.items);
            await this.setItem(META_STORE, TOKEN, parsed.token);
            await this.setItem(META_STORE, QUERY_KEY, this.config.where || '')
            await this.setItem(
                META_STORE,
                SCHEMA_KEY,
                serializeSchema(this.config.schema)
            );
        } catch (e) {
            await this.forget();
        }
    }

    private async setItem(store: string, key: string, item: any) {
        await this.withOpenDb(async (db) => {
            const tx = db.transaction(store, 'readwrite');
            const so = tx.objectStore(store);
            await so.put(item, key);
            await tx.done;
        });
    }

    private async getItem(store: string, key: string) {
        return this.withOpenDb(async (db) => {
            const tx = db.transaction(store, 'readonly');
            const so = tx.objectStore(store);
            const result = await so.get(key);
            await tx.done;
            return result;
        });
    }

    private async setData(data: { [uniqueId: string]: T }) {
        await this.withOpenDb(async (db) => {
            const tx = db.transaction(DATA_STORE, 'readwrite');
            const store = tx.objectStore(DATA_STORE);
            const keys = Object.keys(data);
            for (let i = 0; i < keys.length; i++) {
                const key = keys[i];
                const item = data[key];
                await store.put(item, key);
            }
            await tx.done;
        });
    }

    private async deleteDataItem(uniqueId: string) {
        await this.withOpenDb(async (db) => {
            const tx = db.transaction(DATA_STORE, 'readwrite');
            const store = tx.objectStore(DATA_STORE);
            await store.delete(uniqueId);
            await tx.done;
        });
    }

    async getData(): Promise<T[]> {
        await this.syncData();
        return this.withOpenDb(async (db) => {
            const tx = db.transaction(DATA_STORE, 'readonly');
            const store = tx.objectStore(DATA_STORE);
            const result = await store.getAll();
            await tx.done;
            return result;
        });
    }

    async getDataByKey(key: string, value: any): Promise<T[]> {
        await this.syncData();
        return this.withOpenDb(async (db) => {
            // Get data from index by key
            const tx = db.transaction(DATA_STORE, 'readonly');
            const store = tx.objectStore(DATA_STORE);
            const index = store.index(key);
            const result = await index.getAll(value);
            await tx.done;
            return result;
        });
    }

    async forget(): Promise<void> {
        await deleteDB(this.config.dbName);
    }
    
    updateConfig(config: Partial<StoreConfig>) {
        this.config = {
            ...this.config,
            ...config,
        };
    }

    // Do something to the db, after the callback is executed
    // the db will be closed
    private async withOpenDb<T>(func: (db: IDBPDatabase) => T): Promise<T> {
        const db = await this.openDatabase();
        const result = await func(db);
        db.close();
        return result;
    }
}

// Utils
function serializeSchema(schema: ItemSchema): string {
    return JSON.stringify(schema);
}
