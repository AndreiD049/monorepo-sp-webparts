import { getFieldSetup } from '../../../features/field-setup';
import { NULL } from '../constants';
import { Item, SPECIAL_FIELDS } from '../item';
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
        return Object.keys(this.index).filter((k) => k !== NULL);
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

    private hasVal(item: Item): boolean {
        const val = this.getter(item);
        return val !== undefined && val !== null;
    }

    private buildIndex(): void {
        const index: HashMap = {};
        this.items.forEach((item) => {
            this.addValueToIndex(item, index);
        });
        this.index = index;
    }

    private addValueToIndex(item: Item, index: HashMap): void {
        const key = this.hasVal(item) ? this.getter(item) : null;
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
    private isServiceIndex: Index;
    private _fieldIndexes: IndexMap = {};
    private fieldIndexes: IndexMap;

    constructor(public items: Item[]) {
        this.idIndex = new Index(items, (item) => item.ID?.toString());
        this.tagIndex = new Index(items, (item) => item.Tags);
        this.titleIndex = new Index(items, (item) => item.Title);
        this.isServiceIndex = new Index(items, (item) =>
            String(item.IsService)
        );
        this.fieldIndexes = new Proxy(this._fieldIndexes, {
            get: this.proxyHandlerGet.bind(this),
        });
    }

    public getBy(by: string, value: ValueType): ReadonlySet<Item> {
        switch (by) {
            case 'tag':
            case 'tags':
                return this.tagIndex.get(value);
            case 'title':
                return this.titleIndex.get(value);
            case 'id':
                return this.idIndex.get(value);
            case 'isservice':
            case 'is service':
                return this.isServiceIndex.get(value);
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
                const intermediate = this.filter(filter, result);
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
    
    public filterFirst(f: Filter, fallback?: () => Item): Item {
        const item = this.filterArray(f)[0] || null;
        if (!item && fallback) return fallback();
        return item;
    }

    public itemAdded(item: Item): IndexManager {
        this.items.unshift(item);
        return this.clone()
    }

    public itemRemoved(id: number | string): IndexManager {
        if (typeof id === 'number') {
            this.items = this.items.filter((i) => i.ID !== id);
        } else {
            this.items = this.items.filter((i) => i.Title !== id);
        }
        return this.clone();
    }

    public itemUpdated(oldItem: Item, newItem: Item): IndexManager {
        if (oldItem.ID !== undefined && newItem.ID !== undefined) {
            this.items = this.items.map((i) => (i.ID === oldItem.ID ? newItem : i));
        } else {
            this.items = this.items.map((i) => (i.Title === oldItem.Title ? newItem : i));
        }
        return this.clone();
    }

    public getFields(filter?: Filter): string[] {
        const items = filter ? this.filterArray(filter) : this.items;
        const result = new Set<string>();
        items.forEach((i) => {
            const fieldNames = Object.keys(i.Fields);
            fieldNames.forEach((name) => {
                if (!result.has(name)) {
                    result.add(name);
                }
            });
        });
        SPECIAL_FIELDS.forEach((f) => result.add(f));
        result.delete('text');
        return Array.from(result).sort();
    }

    public getValues(field: string, filter?: Filter): string[] {
        const fieldSetup = getFieldSetup(this, field);
        const result = new Set<string>(fieldSetup.values);
        if (fieldSetup.allowNull) {
            result.add(null);
        }
        if (!fieldSetup.allowNewValues) {
            return Array.from(result).sort();
        }
        if (!filter) {
            this.fieldIndexes[field].values().forEach((v) => {
                result.add(v);
            });
            return Array.from(result).sort();
        }
        const items = this.filterArray(filter);
        items.forEach((item) => {
            const value = item.getFieldOr<string | string[]>(field, null);
            if (value === null) return;
            if (Array.isArray(value)) {
                value.forEach((val) => {
                    result.add(val);
                });
            } else {
                result.add(String(value))
            }
        });
        return Array.from(result).sort();
    }

    public clone(): IndexManager {
        const result = new IndexManager(this.items);
        return result;
    }

    private proxyHandlerGet(target: IndexMap, prop: string): Index {
        if (target[prop] === undefined) {
            target[prop] = new Index(this.items, (item) => item.getField(prop));
        }
        return target[prop];
    }
}
