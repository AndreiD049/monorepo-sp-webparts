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
}

export interface IFeedbackItemRaw extends Omit<IFeedbackItem, 'Fields'> {
    Fields: string;
}