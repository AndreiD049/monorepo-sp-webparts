import { IFeedbackItem, IFeedbackItemRaw, IFields } from "../../models/IFeedbackItem";

export class Item implements IFeedbackItem {
    Id: number;
    Title: string;
    Tags: string[];
    Fields: IFields;
    
    constructor(item?: IFeedbackItemRaw) {
        if (item) {
            this.Id = item.Id;
            this.Title = item.Title;
            this.Tags = item.Tags;
            this.Fields = this.readFields(item.Fields) || {};
        } else {
            this.Title = '';
            this.Tags = [];
            this.Fields = {};
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
    
    public asRaw(): IFeedbackItemRaw {
        const result: IFeedbackItemRaw = { ...this, Fields: JSON.stringify(this.Fields) };
        return result;
    }

    public clone(): Item {
        const result = new Item();
        result.Id = this.Id;
        result.Fields = this.Fields;
        result.Tags = this.Tags;
        result.Title = this.Title;
        return result;
    }
}