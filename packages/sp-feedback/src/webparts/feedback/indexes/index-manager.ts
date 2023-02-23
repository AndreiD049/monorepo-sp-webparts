import { Item } from '../item';

type ValueType = string;
type SearchByType = { field: string } | 'title' | 'tag' | 'id';
type HashMap = {
    [key: ValueType]: Set<Item>;
};
type IndexMap = {
    [key: string]: Index;
};

export interface IIndex {
    get(value: ValueType): ReadonlySet<Item>;
    getArray(value: ValueType): Item[];
    // Mutating already built index
    addItem(item: Item): void;
    removeItem(item: Item): void;
    updateItem(oldItem: Item, newItem: Item): void;
}

// Index is a data structure that allows for efficient items lookup
export class Index implements IIndex {
    private index: HashMap;
    constructor(
        private items: Item[],
        private getter: (item: Item) => ValueType | ValueType[] | undefined
    ) {
        this.index = null;
    }

    updateItem(oldItem: Item, newItem: Item): void {
        if (this.indexBuilt()) {
            this.removeItem(oldItem);
            this.addItem(newItem);
        }
    }

    removeItem(item: Item): void {
        const key = this.getter(item);
        if (this.indexBuilt() && key) {
            if (Array.isArray(key)) {
                key.forEach((k) => {
                    const set = this.get(k);
                    set.forEach((i) => {
                        if (i.Id === item.Id) {
                            (set as Set<Item>).delete(i);
                        }
                    });
                });
            } else {
                (this.get(key) as Set<Item>).delete(item);
            }
        }
    }

    addItem(item: Item): void {
        if (this.indexBuilt()) {
            this.addValueToIndex(item, this.index);
        }
    }

    get(value: ValueType): ReadonlySet<Item> {
        this.checkBuildIndex();
        const result = this.index[value];
        if (!result) {
            return new Set();
        }
        return result;
    }

    getArray(value: string): Item[] {
        return Array.from(this.get(value));
    }
    
    private checkBuildIndex(): void {
        if (!this.indexBuilt()) {
            this.buildIndex();
        }
    }

    private indexBuilt(): boolean {
        return !!this.index;
    }

    private buildIndex(): void {
        const index: HashMap = {};
        this.items.forEach((item) => {
            this.addValueToIndex(item, index);
        });
        this.index = index;
    }

    private addValueToIndex(item: Item, index: HashMap): void {
        const key = this.getter(item);
        if (!key) return;
        if (Array.isArray(key)) {
            key.forEach((k) => {
                if (index[k] === undefined) {
                    index[k] = new Set();
                }
                index[k].add(item);
            });
        } else {
            if (index[key] === undefined) {
                index[key] = new Set();
            }
            index[key].add(item);
        }
    }
}

export class IndexManager {
    private idIndex: Index;
    private tagIndex: Index;
    private titleIndex: Index;
    private _fieldIndexes: IndexMap = {};
    private fieldIndexes: IndexMap;
    private sortFunc = (a: Item, b: Item): number => a.Id - b.Id;

    constructor(public items: Item[]) {
        this.idIndex = new Index(items, (item) => item.Id.toString());
        this.tagIndex = new Index(items, (item) => item.Tags);
        this.titleIndex = new Index(items, (item) => item.Title);
        this.fieldIndexes = new Proxy(this._fieldIndexes, {
            get: this.proxyHandlerGet,
        });
    }

    public getBy(by: SearchByType, value: ValueType): ReadonlySet<Item> {
        switch (by) {
            case 'tag':
                return this.tagIndex.get(value);
            case 'title':
                return this.titleIndex.get(value);
            case 'id':
                return this.idIndex.get(value);
            default:
                return this.fieldIndexes[by.field].get(value);
        }
    }

    public getArrayBy(by: SearchByType, value: ValueType): Item[] {
        switch (by) {
            case 'tag':
                return this.tagIndex.getArray(value).sort(this.sortFunc);
            case 'title':
                return this.titleIndex.getArray(value).sort(this.sortFunc);
            case 'id':
                return this.idIndex.getArray(value).sort(this.sortFunc);
            default:
                return this.fieldIndexes[by.field].getArray(value).sort(this.sortFunc);
        }
    }
    
    public itemAdded(item: Item): void {
        this.items.push(item);
        this.tagIndex.addItem(item);
        this.titleIndex.addItem(item);
        for (const key in this.fieldIndexes) {
            if (Object.prototype.hasOwnProperty.call(this.fieldIndexes, key)) {
                const index = this.fieldIndexes[key];
                index.addItem(item);
            }
        }
    }

    public itemRemoved(item: Item): void {
        this.items = this.items.filter((i) => i.Id !== item.Id);
        this.tagIndex.removeItem(item);
        this.titleIndex.removeItem(item);
        for (const key in this.fieldIndexes) {
            if (Object.prototype.hasOwnProperty.call(this.fieldIndexes, key)) {
                const index = this.fieldIndexes[key];
                index.removeItem(item);
            }
        }
    }

    public itemUpdated(oldItem: Item, newItem: Item): void {
        this.items = this.items.map((i) => i.Id === oldItem.Id ? newItem : i);
        this.tagIndex.updateItem(oldItem, newItem);
        this.titleIndex.updateItem(oldItem, newItem);
        for (const key in this.fieldIndexes) {
            if (Object.prototype.hasOwnProperty.call(this.fieldIndexes, key)) {
                const index = this.fieldIndexes[key];
                index.updateItem(oldItem, newItem);
            }
        }
    }

    private proxyHandlerGet(target: IndexMap, prop: string): Index {
        if (target[prop] === undefined) {
            target[prop] = new Index(this.items, (item) => item.getField(prop));
        }
        return target[prop];
    }
}
