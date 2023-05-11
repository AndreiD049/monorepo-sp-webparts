// Basically, this package will allow you to have the whole list
// stored in the indexedDB, and you can use it as a cache.
//
// Configuration

import { IWeb } from '@pnp/sp/webs';
import { IChangeLogItemQuery, IList } from '@pnp/sp/lists';
import { SPFI } from '@pnp/sp';

const ROW_LIMIT = '500';
// MAX: 25 000 items
const MAX_REQUESTS = 50;

type FieldType = "String" | "Boolean" | "Number";

type ItemSchema = {
	[fieldName: string]: FieldType;
};

type Config = {
	// IndexedDb config
	dbName: string;
	storeName: string;

	// Sharepoint api config
	sp: SPFI;
	listName: string;

	// Schema
	schema: ItemSchema;
}

// Parser
function parseXml(xml: string): Document {
	const parser = new DOMParser();
	const doc = parser.parseFromString(xml, 'text/xml');
	return doc;
}

function getToken(doc: Document): string {
	const token = doc.querySelector('Changes[LastChangeToken]');
	if (!token) {
		return '';
	}
	return token.getAttribute('LastChangeToken') || '';
}

// If list is big enough, we need to handle paging
function getNextToken(doc: Document): string {
	const more = doc.querySelector('listitems > data[ListItemCollectionPositionNext]');
	if (!more) {
		return '';
	}
	return more.getAttribute('ListItemCollectionPositionNext')?.replace('&', '&amp;') || '';
}

function parseItem<T>(item: Element, schema: ItemSchema): T {
	const data: any = {};
	const fields = Object.keys(schema);
	for (let i = 0; i < fields.length; i++) {
		const field = fields[i];
		const type = schema[field];
		const value = item.getAttribute('ows_' + field);
		if (!value) {
			continue;
		}
		switch (type) {
			case 'String':
				data[field] = value || '';
				break;
			case 'Number':
				data[field] = parseInt(value || '0');
				break;
			case 'Boolean':
				data[field] = value === '1';
				break;
		}
	}
	data.__UniqueId = item.getAttribute('ows_UniqueId');
	return data as T;
}

type Changes<T> = {
	Deletes: string[];
	Items: (T & { __UniqueId: string })[];
};

function parseData<T>(doc: Document, schema: ItemSchema): Changes<T> {
	const result: Changes<T> = {
		Deletes: [],
		Items: [],
	};

	const data = doc.querySelector('listitems > data');
	if (!data) {
		return result;
	}
	
	if (data.getAttribute('ItemCount') !== '0') {
		const items = data.querySelectorAll('row');
		// Read the items
		for (let i = 0; i < items.length; i++) {
			result.Items.push(parseItem(items[i], schema));
		}
	}
	
	// Read the deletes
	const deletes = doc.querySelectorAll('listitems > Changes > Id[ChangeType="Delete"]');
	for (let i = 0; i < deletes.length; i++) {
		const uniqueId = deletes[i].getAttribute('UniqueId');
		const itemId = deletes[i].textContent;
		if (!uniqueId || !itemId) {
			continue;
		}
		result.Deletes.push(itemId + ';#' + uniqueId);
	}

	return result;
}

export class Storage<T> {
	private token?: string;
	private data: { [id: string]: T };

	constructor(private schema: ItemSchema) {
		this.token = undefined;
		this.data = {};
	}

	public async getToken() {
		return this.token;
	}

	public async setToken(token: string | undefined) {
		this.token = token;
	}

	public async getData(): Promise<T[]> {
		return Object.values(this.data);
	}

	public fullResyncRequired(document: Document) {
		// Check if full resync required
		// See Change Events: https://learn.microsoft.com/en-us/previous-versions/office/developer/sharepoint-2010/cc264031(v=office.14)#change-events
		console.log(document);
		return false;
	}

	public applyChanges(document: Document): void {
		const data = parseData<T>(document, this.schema);

		const token = getToken(document);
		if (token && !this.token) {
			this.data = {};
		}
		if (token) {
			this.setToken(token);
		}

		if (data.Deletes.length > 0) {
			for (let i = 0; i < data.Deletes.length; i++) {
				delete this.data[data.Deletes[i]];
			}
		}
		if (data.Items.length > 0) {
			for (let i = 0; i < data.Items.length; i++) {
				const item = data.Items[i];
				this.data[item.__UniqueId] = item;
			}
		}
	}
}

export class SyncedList<T> {

	private list: IList;
	private viewFields: string;
	public storage: Storage<T>;

	constructor(private config: Config) {
		const web: IWeb = config.sp.web;

		this.list = web.lists.getByTitle(config.listName);
		this.storage = new Storage<T>(this.config.schema);

		this.viewFields = this.getViewFields();
	}

	private getViewFields(): string {
		const fields = Object.keys(this.config.schema);
		const body = fields.map(field => `<FieldRef Name="${field}" />`).join('');
		return `<ViewFields>${body}</ViewFields>`;
	}

	private async getQueryConfig(nextToken?: string): Promise<IChangeLogItemQuery> {
		return {
			// When we have a nextToken, we don't need a LastChangeToken
			ChangeToken: nextToken ? undefined : await this.storage.getToken(),
			RowLimit: ROW_LIMIT,
			ViewFields: this.viewFields,
			QueryOptions: `<QueryOptions>${nextToken ? `<Paging ListItemCollectionPositionNext="${nextToken}" />` : ''}</QueryOptions>`,
		}
	}

	public async getData(): Promise<T[]> {

		let nextToken = '';
		for(let req = 0; req < MAX_REQUESTS; req++) {
			const queryConfig = await this.getQueryConfig(nextToken);
			const items = await this.list.getListItemChangesSinceToken(queryConfig);
			const doc = parseXml(items);

			// Full resync is required, loop over
			if (this.storage.fullResyncRequired(doc)) {
				this.storage.setToken(undefined);
				continue;
			}

			this.storage.applyChanges(doc);
			nextToken = getNextToken(doc);

			if (!nextToken) {
				break;
			}
		}
		if (nextToken) {
			console.warn(`More than ${MAX_REQUESTS} requests were required to sync the list. Potentially incomplete data.`);
		}

		return this.storage.getData();
	}
}

export function Run(config: Config) {
	console.log('Running', config);
}
