import { deleteDB, IDBPDatabase, openDB } from 'idb';
import { parseInt } from 'lodash';
import { SPFI } from 'sp-preset';

type Person = { Id: number; Title: string; EMail: string };
type FieldType = 'Number' | 'String' | 'Person' | 'List' | 'Boolean';
type FieldValue = number | string | string[] | Person | boolean;
type Field = { field: string; type: FieldType; key?: string };
export type IncSyncConfig = {
    dbName: string;
    tokenStoreName: string;
    dataStoreName: string;
    dataKeyField: string;
    fields: Field[];
};

// IndexedDb Operations
function createSyncObjectStores(
    dataStoreName: string,
    tokenStoreName: string,
    db: IDBPDatabase,
    dataKeyField: string
): void {
    db.createObjectStore(tokenStoreName);
    db.createObjectStore(dataStoreName, { keyPath: dataKeyField });
}

async function withSyncFallback<T>(
    dbName: string,
    func: () => Promise<T>
): Promise<T> {
    try {
        return func();
    } catch (err) {
        console.error(err);
        await deleteDB(dbName);
    }
}

async function openSyncDb(
    dbName: string,
    tokenStoreName: string,
    dataStoreName: string,
    dataKeyPath: string
): Promise<IDBPDatabase> {
    try {
        return openDB(dbName, undefined, {
            upgrade: (db) =>
                createSyncObjectStores(
                    dataStoreName,
                    tokenStoreName,
                    db,
                    dataKeyPath
                ),
            blocking: (_v1, _v2, event) => {
                const db = event.target as IDBDatabase;
                db.close();
            },
        });
    } catch (err) {
        await deleteDB(dbName);
        return null;
    }
}

async function getLocalToken(
    db: IDBPDatabase,
    tokenStoreName: string
): Promise<string> {
    if (!db) return null;
    const tx = db
        .transaction(tokenStoreName, 'readonly')
        .objectStore(tokenStoreName);
    return tx.get('token');
}

async function setLocalToken(
    db: IDBPDatabase,
    tokenStoreName: string,
    value: string
): Promise<void> {
    const tx = db
        .transaction(tokenStoreName, 'readwrite')
        .objectStore(tokenStoreName);
    await tx.put(value, 'token');
}

async function getLocalItems<T>(
    db: IDBPDatabase,
    storeName: string
): Promise<T[]> {
    if (!db) return [];
    const tx = db.transaction(storeName, 'readonly').objectStore(storeName);
    return tx.getAll() as unknown as T[];
}

async function setLocalItems<T>(
    db: IDBPDatabase,
    storeName: string,
    items: T[]
): Promise<void> {
    const tx = db.transaction(storeName, 'readwrite').objectStore(storeName);
    const calls = items.map((item) => tx.put(item));
    await Promise.all(calls);
}

async function deleteLocalItems(
    db: IDBPDatabase,
    storeName: string,
    ids: number[]
): Promise<void> {
    const tx = db.transaction(storeName, 'readwrite').objectStore(storeName);
    const calls = ids.map((id) => tx.delete(id));
    await Promise.all(calls);
}

// Validation
function isValidToken(token: string): boolean {
    return token !== undefined;
}

function hasItems<T>(items: T[]): boolean {
    return items && items.length && items.length > 0;
}

function parsePersonField(value: string): Person {
    let parts = value.split(';#');
    const Id = +parts[0];
    parts = parts[1].split(',#');
    const Title = parts[parts.length - 1];
    const EMail = parts[parts.length - 2];
    return { Id, Title, EMail };
}

function parseList(value: string): string[] {
    if (!value) return null;
    return value.slice(2, value.length - 2).split(';#');
}

function processFieldValue(value: string, fieldType: FieldType): FieldValue {
    switch (fieldType) {
        case 'Number':
            return +value;
        case 'Person':
            return parsePersonField(value);
        case 'List':
            return parseList(value);
        case 'Boolean':
            return value === '1';
        default:
            return value;
    }
}

function getViewFields(fields: Field[]): string {
    if (!fields || fields.length === 0) return undefined;
    const fieldsXml = fields.map((f) => `<FieldRef Name="${f.field}" />`);
    return `<ViewFields>${fieldsXml}</ViewFields>`;
}

function getDocument(xml: string): Document {
    const parser = new DOMParser();
    return parser.parseFromString(xml, 'text/xml');
}

function readValue<T>(el: Element, fields: Field[]): T {
    const obj: { [key: string]: FieldValue } = {};
    fields.forEach((f) => {
        const key = f.key || f.field;
        obj[key] = processFieldValue(el.getAttribute(`ows_${f.field}`), f.type);
    });
    return obj as unknown as T;
}

export function parseListItems<T>(doc: Document, fields: Field[]): T[] {
    const itemNodes = doc.querySelectorAll('row');
    const result: T[] = [];
    itemNodes.forEach((item) => {
        result.push(readValue(item, fields));
    });
    return result;
}

export function getDeletes(doc: Document): number[] {
    const deleteEls = doc.querySelectorAll("Id[ChangeType='Delete']");
    return Array.from(deleteEls).map((el) => parseInt(el.textContent));
}

function getRemoteToken(doc: Document): string {
    const changes = doc.querySelector('Changes');
    if (!changes) return null;
    return changes.getAttribute('LastChangeToken');
}

function hasChanges(doc: Document): boolean {
    const changes = doc.querySelectorAll('Changes Id');
    if (changes && changes.length > 0) return true;
    const data = doc.querySelector('data');
    if (!data) return false;
    return data.getAttribute('ItemCount') !== '0';
}

async function getAllListItemsXml(
    sp: SPFI,
    listName: string,
    fields: Field[]
): Promise<string> {
    return getChangesSinceToken(sp, listName, null, fields);
}

async function getChangesSinceToken(
    sp: SPFI,
    listName: string,
    token: string,
    fields: Field[]
): Promise<string> {
    const list = sp.web.lists.getByTitle(listName);
    return list.getListItemChangesSinceToken({
        ChangeToken: token,
        ViewFields: getViewFields(fields),
        QueryOptions: `<QueryOptions><ExpandUserField>TRUE</ExpandUserField></QueryOptions>`,
    });
}

export async function removeLocalCache(dbName: string): Promise<void> {
    return deleteDB(dbName);
}

// Does the main work
// Checks if we have a token or items, and syncs the changes that occured since last sync
// If no token or items. Will do a full sync.
export async function syncList<T>(
    db: IDBPDatabase,
    sp: SPFI,
    listName: string,
    config: IncSyncConfig
): Promise<void> {
    const token = await getLocalToken(db, config.tokenStoreName);
    const items = await getLocalItems<T>(db, config.dataStoreName);
    if (!isValidToken(token) || !hasItems(items)) {
        const xml = await getAllListItemsXml(sp, listName, config.fields);
        const doc = getDocument(xml);
        const newToken = getRemoteToken(doc);
        const newItems = parseListItems(doc, config.fields);
        await setLocalToken(db, config.tokenStoreName, newToken);
        await setLocalItems(db, config.dataStoreName, newItems);
    } else {
        // Get changes and merge them with current items
        const changes = await getChangesSinceToken(
            sp,
            listName,
            token,
            config.fields
        );
        const doc = getDocument(changes);
        if (hasChanges(doc)) {
            // Process deletes
            const deletes = getDeletes(doc);
            await deleteLocalItems(db, config.dataStoreName, deletes);
            // Process changes/inserts
            const newItems = parseListItems(doc, config.fields);
            await setLocalItems(db, config.dataStoreName, newItems);
            const newToken = getRemoteToken(doc);
            await setLocalToken(db, config.tokenStoreName, newToken);
        }
    }
}

type SyncServiceType = {
    db: IDBPDatabase;
    config: IncSyncConfig;
    initService: (sp: SPFI, listName: string, config: IncSyncConfig) => Promise<void>;
    getItems: <T>() => Promise<T[]>;
};

export const SyncService: SyncServiceType = {
    db: null,
    config: null,
    initService: async function (sp, listName, config) {
        return withSyncFallback(config.dbName, async () => {
            this.config = config;
            this.db = await openSyncDb(
                config.dbName,
                config.tokenStoreName,
                config.dataStoreName,
                config.dataKeyField
            );
            await syncList(this.db, sp, listName, config);
        });
    },
    getItems: async function<T>() { return getLocalItems<T>(this.db, this.config.dataStoreName) },
};
