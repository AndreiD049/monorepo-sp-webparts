import { IFeedbackItem, IFeedbackItemRaw, IFields } from "../../models/IFeedbackItem";
import { replaceImagesInHtml } from "./utils";

export class Item implements IFeedbackItem {
    Id: number;
    Title: string;
    Tags: string[];
    IsService: boolean;
    Fields: IFields;
    
    constructor(item?: IFeedbackItemRaw) {
        if (item) {
            this.Id = item.Id;
            this.Title = item.Title;
            this.Tags = item.Tags;
            this.IsService = item.IsService;
            this.Fields = this.readFields(item.Fields) || {};
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
        } catch {
            return null;
        }
    }
    
    public getFieldOr<T>(field: string, def: IFields['k']): T {
        if (field === 'title') return this.Title as unknown as T;
        if (field === 'id') return this.Id as unknown as T;
        if (field === 'tags') return this.Tags as unknown as T;
        if (field === 'isservice') return this.IsService as unknown as T;
        return (this.Fields[field] ?? def) as T;
    }
    
    public getField<T>(field: string): T {
        return this.getFieldOr<T>(field, null);
    }
    
    public setField<T>(field: string, value: T): Item {
        const result = this.clone();
        result.Fields[field] = value;
        return result;
    }
    
    public unsetField(field: string): Item {
        const result = this.clone();
        delete this.Fields[field];
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
        const result = this.clone();
        const oldContent = result.getField<string>(field);
        const newContent = await replaceImagesInHtml(oldContent);
        result.setField(field, newContent);
        return result;
    }
    
    public asRaw(): IFeedbackItemRaw {
        const result: IFeedbackItemRaw = { ...this, Fields: JSON.stringify(this.Fields) };
        return result;
    }

    public clone(): Item {
        const result = new Item(this.asRaw());
        return result;
    }
}