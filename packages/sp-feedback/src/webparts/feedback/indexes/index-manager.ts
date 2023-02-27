import { Item } from '../item';
import { Filter, getFieldAndValue, getFilterOp } from './filter';
import { filterSet, setIntersection, setUnion } from './set-operations';

type ValueType = string;
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
        function mapReplace(i: Item): Item {
            return i.Id === oldItem.Id ? newItem : i;
        }
        const key = this.getter(oldItem) || null;
        if (this.indexBuilt()) {
            if (Array.isArray(key)) {
                key.forEach((k) => {
                    const set = this.getArray(k).map(mapReplace);
                    this.index[k] = new Set(set);
                });
            } else {
                this.index[key] = new Set(this.getArray(key).map(mapReplace));
            }
        }
    }

    removeItem(item: Item): void {
        const key = this.getter(item) || null;
        if (this.indexBuilt()) {
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
    
    values(): string[] {
        this.checkBuildIndex();
        return Object.keys(this.index);
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
        const key = this.getter(item) || null;
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
    private fieldNamesIndex: Set<string> = new Set();

    constructor(public items: Item[]) {
        this.idIndex = new Index(items, (item) => item.Id.toString());
        this.tagIndex = new Index(items, (item) => item.Tags);
        this.titleIndex = new Index(items, (item) => item.Title);
        this.fieldIndexes = new Proxy(this._fieldIndexes, {
            get: this.proxyHandlerGet.bind(this),
        });
    }

    public getBy(by: string, value: ValueType): ReadonlySet<Item> {
        switch (by) {
            case 'tag':
                return this.tagIndex.get(value);
            case 'title':
                return this.titleIndex.get(value);
            case 'id':
                return this.idIndex.get(value);
            default:
                return this.fieldIndexes[by].get(value);
        }
    }

    public filter(f: Filter, contextItems?: Set<Item>): ReadonlySet<Item> {
        if (!f) return new Set();
        contextItems = contextItems || new Set(this.items);
        if (f.$or) {
            let result = new Set<Item>();
            for (const filter of f.$or) {
                const intermediate = this.filter(filter, contextItems);
                result = setUnion(result, intermediate);
            }
            return result;
        }
        if (f.$and) {
            let result = contextItems;
            for (const filter of f.$and) {
                const intermediate = this.filter(
                    filter,
                    result
                );
                if (intermediate.size === 0) return new Set();
                if (!result) {
                    result = intermediate as Set<Item>;
                } else {
                    result = setIntersection(result, intermediate);
                }
            }
            return result;
        }
        const key = getFilterOp(f);
        const [field, value] = getFieldAndValue(f);
        if (key === '$eq') {
            return this.getBy(field, value);
        }
        if (key === '$ne') {
            return filterSet(contextItems, (item) => {
                const fieldValue = item.getField(field);
                if (Array.isArray(fieldValue)) {
                    return fieldValue.every((v) => v !== value);
                }
                return fieldValue !== value;
            });
        }
        throw Error(`Invalid fitler ${JSON.stringify(f)}`);
    }

    public filterArray(f: Filter): Item[] {
        return Array.from(this.filter(f));
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
        this.items = this.items.map((i) => (i.Id === oldItem.Id ? newItem : i));
        this.tagIndex.updateItem(oldItem, newItem);
        this.titleIndex.updateItem(oldItem, newItem);
        for (const key in this.fieldIndexes) {
            if (Object.prototype.hasOwnProperty.call(this.fieldIndexes, key)) {
                const index = this.fieldIndexes[key];
                index.updateItem(oldItem, newItem);
            }
        }
    }
    
    public getFields(): string[] {
        if (this.fieldNamesIndex.size === 0) {
            this.items.forEach((i) => {
                const fieldNames = Object.keys(i.Fields);
                fieldNames.forEach((name) => {
                    if (!this.fieldNamesIndex.has(name)) {
                        this.fieldNamesIndex.add(name);
                    }
                })
            });
            this.fieldNamesIndex.add('tags');
            this.fieldNamesIndex.add('title');
        }
        return Array.from(this.fieldNamesIndex);
    }
    
    public getValues(field: string): string[] {
        return this.fieldIndexes[field].values();
    }

    private proxyHandlerGet(target: IndexMap, prop: string): Index {
        if (target[prop] === undefined) {
            target[prop] = new Index(this.items, (item) => item.getField(prop));
        }
        return target[prop];
    }
}
