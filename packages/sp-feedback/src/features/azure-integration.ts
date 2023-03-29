// test token 4whgx6iikqu6kplsrvz2ybzwnp4okxbarswwa7zpkoot6bp5mlda
// call GET https://dev.azure.com/{organization}/{project}/_apis/wit/workitems?ids={ids}&api-version=7.1-preview.3

import { createCacheProxy } from 'idb-proxy';
import { DB_NAME, MINUTE, STORE_NAME } from '../webparts/feedback/constants';
import { $and, $ne } from '../webparts/feedback/indexes/filter';
import { IndexManager } from '../webparts/feedback/indexes/index-manager';
import { Item } from '../webparts/feedback/item';

export type AzureWorkItem = {
    id: number;
    fields: {
        'System.Title': string;
        'System.State': string;
        'System.WorkItemType': string;
    };
};

export type AzureWorkItemResponse = {
    count: number;
    value: AzureWorkItem[];
};

export enum AzureFields {
    id = '$azureWorkItemId',
    title = '$azureWorkItemTitle',
    state = '$azureWorkItemState',
    type = '$azureWorkItemType',
}

class AzureDevopsService {
    public isActive: boolean = false;
    public isSynced: boolean = false;
    private url: string = null;
    private patToken: string = null;

    public init(url: string, token: string): void {
        if (!token || !url) return;
        this.patToken = token;
        this.url = url;
        this.isActive = true;
    }

    private getHeaders(): Headers {
        return new Headers({
            Authorization: 'Basic ' + btoa(':' + this.patToken),
            Accept: 'application/json',
        });
    }

    private getRequest(url: string, method: string): Request {
        return new Request(url, {
            method: method,
            headers: this.getHeaders(),
        });
    }

    private async getWorkItemsBatch(
        ids: number[]
    ): Promise<AzureWorkItemResponse> {
        const idsParam = ids.join(',');
        const fullUrl = `${this.url}/_apis/wit/workitems?ids=${idsParam}&api-version=7.1-preview.3`;
        return fetch(this.getRequest(fullUrl, 'GET'))
            .then((response) => response.json())
            .catch((error) => console.log(error));
    }

    public async getWorkItems(ids: number[]): Promise<AzureWorkItemResponse> {
        const idArrays = splitArray(ids, 200);
        const promises = idArrays.map((idArray) =>
            this.getWorkItemsBatch(idArray)
        );
        const results = await Promise.all(promises);
        const value = results.reduce(
            (acc, result) => [...acc, ...result.value],
            []
        );
        return {
            count: value.length,
            value,
        };
    }
}

export function splitArray<T>(array: T[], size: number): T[][] {
    const result = [];
    for (let i = 0; i < array.length; i += size) {
        result.push(array.slice(i, i + size));
    }
    return result;
}

export const azureDevopsService = new AzureDevopsService();
export const cachedDevopsService = createCacheProxy(azureDevopsService, {
    dbName: DB_NAME,
    storeName: STORE_NAME,
    prefix: 'azureWorkItems',
    props: {
        getWorkItems: {
            isCached: true,
            isPattern: false,
            expiresIn: MINUTE * 15,
        },
    },
});

export function getAllAzureLinkedFeedbacks(
    indexManager: IndexManager,
    service: AzureDevopsService
): Item[] {
    if (!service.isActive) return [];
    return indexManager.filterArray(
        $and(
            $ne(AzureFields.id, null),
            $ne(AzureFields.state, 'Done'),
            $ne(AzureFields.state, 'Removed')
        )
    );
}

export function createAzureItemsMap(items: Item[]): Map<number, Item[]> {
    const map = new Map<number, Item[]>();
    items.forEach((item) => {
        const azureId = item.getField<string>(AzureFields.id);
        if (azureId && !isNaN(+azureId)) {
            const array = map.get(+azureId) || [];
            array.push(item);
            map.set(+azureId, array);
        }
    });
    return map;
}

export function getAzureItemIdsFromMap(map: Map<number, Item[]>): number[] {
    return Array.from(map.keys());
}

export type AzureItemsChange = {
    workItem: AzureWorkItem;
    item: Item;
};

export function getAzureItemChanges(
    workitems: AzureWorkItem[],
    map: Map<number, Item[]>
): AzureItemsChange[] {
    const changes: AzureItemsChange[] = [];
    workitems.forEach((workItem) => {
        const items = map.get(workItem.id);
        if (items) {
            items.forEach((item) => {
                if (isItemChanged(item, workItem)) {
                    changes.push({ workItem, item });
                }
            });
        }
    });
    return changes;
}

export function getChangedFields(change: AzureItemsChange): {
    [key: string]: string;
} {
    return {
        ...change.item.Fields,
        [AzureFields.title]: change.workItem.fields['System.Title'],
        [AzureFields.state]: change.workItem.fields['System.State'],
        [AzureFields.type]: change.workItem.fields['System.WorkItemType'],
    };
}

export function isItemChanged(
    item: Item,
    azureWorkItem: AzureWorkItem
): boolean {
    const title = item.getField<string>(AzureFields.title);
    const state = item.getField<string>(AzureFields.state);
    const type = item.getField<string>(AzureFields.type);
    return (
        title !== azureWorkItem.fields['System.Title'] ||
        state !== azureWorkItem.fields['System.State'] ||
        type !== azureWorkItem.fields['System.WorkItemType']
    );
}
