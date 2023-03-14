export interface IFields {
    text?: string;
    [key: string]: string | string[] | Omit<IFields, 'text'>;
}

export interface IFeedbackItem {
    Id: number;
    Title: string;
    Tags: string[];
    Fields: IFields;
    IsService: boolean;
    Created: string | Date;
    Author: {
        Id: number;
        EMail: string;
        Title: string;
    }
}

export interface IFeedbackItemRaw extends Omit<IFeedbackItem, 'Fields'> {
    Fields: string;
}

export function isRaw(item: IFeedbackItem | IFeedbackItemRaw): item is IFeedbackItemRaw {
    return typeof item.Fields === 'string';
}