import { ITag } from "@fluentui/react";

export interface ITagWithData<T> extends ITag {
    data: T;
}

export interface LookupOptions<T> {
    options: T[];
    set: React.Dispatch<React.SetStateAction<T[]>>;
    tags: ITagWithData<T>[];
}