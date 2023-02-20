import { Item } from "../item";

export interface IIndex {
    tags: {
        [tag: string]: Set<Item>;
    }
}

export class Index {
    public tags: {
        [tag: string]: Set<Item>;
    } = {};
    public items: Item[] = [];
    
    public findByTag(tag: string): Item[] {
        return Array.from(this.tags[tag] || []);
    }
    
    public findByTags(tags: string[]): Item[] {
        const first = tags[0];
        const rest = tags.slice(1);
        const initialSet = this.findByTag(first);
        const result: Item[] = [];
        initialSet.forEach((item) => {
            if (rest.every((tag) => this.tags[tag].has(item))) {
                result.push(item);
            }
        })
        return result;
    }
    
    public addItem(item: Item): Index {
        return buildIndex([...this.items, item]);
    }
    
    public clone(): Index {
        const result = new Index();
        result.tags = this.tags;
        result.items = this.items;
        return result;
    }
}

export function buildIndex(items: Item[]): Index {
    const index = new Index();    
    index.items = items;

    items.forEach((item) => {
        if (item.Tags) {
            item.Tags.forEach((tag) => {
                if (index.tags[tag] === undefined) {
                    index.tags[tag] = new Set();
                }
                index.tags[tag].add(item);
            })
        }
    });
    
    return index;
}