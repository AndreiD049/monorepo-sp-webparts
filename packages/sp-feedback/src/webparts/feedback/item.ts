import {
    IFeedbackItem,
    IFeedbackItemRaw,
    IFields,
} from '../../models/IFeedbackItem';
import { replaceImagesInHtml } from './utils';

type SPECIAL_KEYS =
    | 'title'
    | 'id'
    | 'tags'
    | 'is service'
    | 'isservice'
    | 'author id'
    | 'author email'
    | 'author title'
    | 'created'
    | 'modified';
export const SPECIAL_FIELDS: SPECIAL_KEYS[] = [
    'title',
    'id',
    'tags',
    'is service',
    'isservice',
    'created',
    'author id',
    'author email',
    'author title',
    'modified'
];

export class Item implements IFeedbackItem {
    ID: number | string;
    Title: string;
    Tags: string[];
    IsService: boolean;
    Author: { Id: number; EMail: string; Title: string };
    Created: Date;
    Modified: Date;
    Fields: IFields;

    constructor(item?: IFeedbackItemRaw | IFeedbackItem) {
        if (item) {
            this.ID = item.ID;
            this.Title = item.Title;
            this.Tags = item.Tags;
            this.IsService = item.IsService;
            this.Created = new Date(item.Created);
            this.Modified = new Date(item.Modified);
            this.Author = item.Author;
            if (typeof item.Fields === 'string') {
                this.Fields = this.readFields(item.Fields) || {};
            } else {
                this.Fields = { ...item.Fields }; 
            }
        } else {
            this.Title = '';
            this.Tags = [];
            this.Fields = {};
            this.IsService = false;
        }
    }

    private readFields(fieldsRaw: string): IFields {
        try {
            return JSON.parse(fieldsRaw);
        } catch (err) {
            console.error(err, fieldsRaw);
            return {};
        }
    }

    public getFieldOr<T>(field: string, defaultValue: IFields['k']): T {
        if (isSpecialField(field)) {
            return getSpecialFieldValue(this, field);
        }
        return (this.Fields[field] !== undefined ? this.Fields[field] : defaultValue) as T;
    }

    public getField<T>(field: string): T {
        return this.getFieldOr<T>(field, null);
    }

    public setField<T>(field: string, value: T): Item {
        const result = this.clone();
        if (isSpecialField(field)) {
            return setSpecialFieldValue(this, field, value);
        }
        result.Fields[field] = value;
        return result;
    }

    public unsetField(field: string): Item {
        const result = this.clone();
        result.Fields[field] = undefined;
        return result;
    }

    public setTitle(value: string): Item {
        const result = this.clone();
        result.Title = value;
        return result;
    }

    public addTag(tag: string): Item {
        const result = this.clone();
        if (result.Tags.indexOf(tag) === -1) {
            this.Tags.push(tag);
        }
        return result;
    }

    public setTags(tags: string[]): Item {
        const result = this.clone();
        result.Tags = tags;
        return result;
    }

    public async replaceImagesIn(field: string): Promise<Item> {
        let result = this.clone();
        const oldContent = result.getField<string>(field);
        const newContent = await replaceImagesInHtml(oldContent);
        result = result.setField(field, newContent);
        return result;
    }

    public asRaw(): IFeedbackItemRaw {
        const result: IFeedbackItemRaw = {
            ...this,
            Fields: JSON.stringify(this.Fields),
        };
        return result;
    }

    public clone(): Item {
        const result = new Item(this);
        return result;
    }

    public mergeFields(other: IFields): Item {
        let result = this.clone();
        const keys = Object.keys(other);
        keys.forEach((k) => {
            result = result.setField(k, other[k]);
        });
        return result;
    }
}

function isSpecialField(field: string): field is SPECIAL_KEYS {
    return SPECIAL_FIELDS.indexOf(field?.toLowerCase() as SPECIAL_KEYS) > -1;
}

function setSpecialFieldValue(
    item: Item,
    field: SPECIAL_KEYS,
    value: unknown
): Item {
    let result = item.clone();
    switch (field.toLowerCase()) {
        case 'id':
            result.ID = value as number;
            break;
        case 'is service':
        case 'isservice':
            result.IsService = value as boolean;
            break;
        case 'tags':
            result = result.setTags(value as string[]);
            break;
        case 'title':
            result.Title = value as string;
            break;
        case 'created':
            result.Created = value as Date;
            break;
        case 'modified':
            result.Modified = value as Date;
            break;
        case 'author id':
            if (!result.Author) {
                result.Author = { Id: null, EMail: null, Title: null };
            }
            result.Author.Id = value as number;
            break;
        case 'author email':
            if (!result.Author) {
                result.Author = { Id: null, EMail: null, Title: null };
            }
            result.Author.EMail = value as string;
            break;
        case 'author title':
            if (!result.Author) {
                result.Author = { Id: null, EMail: null, Title: null };
            }
            result.Author.Title = value as string;
            break;
        default:
            throw Error(`Not a special field ${field}`);
    }
    return result;
}

function getSpecialFieldValue<T>(item: Item, field: SPECIAL_KEYS): T {
    let result: T;
    switch (field) {
        case 'id':
            result = item.ID as unknown as T;
            break;
        case 'is service':
        case 'isservice':
            result = item.IsService as unknown as T;
            break;
        case 'tags':
            result = item.Tags as unknown as T;
            break;
        case 'title':
            result = item.Title as unknown as T;
            break;
        case 'created':
            result = item.Created as unknown as T;
            break;
        case 'modified':
            result = item.Modified as unknown as T;
            break;
        case 'author id':
            result = (item.Author?.Id || null) as unknown as T;
            break;
        case 'author email':
            result = (item.Author?.EMail || null) as unknown as T;
            break;
        case 'author title':
            result = (item.Author?.Title || null) as unknown as T;
            break;
        default:
            throw Error(`Not a special field ${field}`);
    }
    return result;
}
