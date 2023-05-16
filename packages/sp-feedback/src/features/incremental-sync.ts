import { IDBStoreProvider, ItemSchema } from 'sp-incremental-sync';
import { DB_NAME } from '../webparts/feedback/constants';
import { IList } from 'sp-preset';
import { IFeedbackItemRaw } from '../models/IFeedbackItem';

export const schema: ItemSchema = {
    ID: {
        type: 'Integer',
        indexed: true,
    },
    Title: {
        type: 'String',
    },
    Tags: {
        type: 'MultiChoice',
    },
    Fields: {
        type: 'String',
    },
    IsService: {
        type: 'Boolean',
        indexed: true,
    },
    Created: {
        type: 'String',
    },
    Modified: {
        type: 'String',
    },
    Author: {
        type: 'Person',
    },
};

export function getSyncProvider(list: IList): IDBStoreProvider<IFeedbackItemRaw> {
    return new IDBStoreProvider<IFeedbackItemRaw>({
        dbName: DB_NAME,
        schema,
        maxRequests: 100,
        rowLimit: '500',
        list,
    });
}
