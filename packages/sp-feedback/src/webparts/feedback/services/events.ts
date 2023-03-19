import { IFeedbackItemRaw, IFields } from '../../../models/IFeedbackItem';
import { ItemsService } from '../../../services/items-service';
import { TempItemsService } from '../../../services/temp-items-service';
import { $eq } from '../indexes/filter';
import { IndexManager } from '../indexes/index-manager';
import { Item } from '../item';

export const ITEM_ADDED = 'spfxFeedback/ItemAdded';
export const ITEM_UPDATED = 'spfxFeedback/ItemUpdated';
export const ITEM_DELETED = 'spfxFeedback/ItemDeleted';


type ItemOptions = {
    temp: boolean;
    persist?: boolean;
};
const defaultOptions: ItemOptions = { temp: false, persist: false };

type AddItemPayload = {
    item: IFeedbackItemRaw;
    callback?: () => void;
    options?: ItemOptions;
};

type UpdateItemPayload = {
    id: number | string;
    payload: Partial<IFields>;
    callback?: () => void;
    options?: ItemOptions;
};

type DeletePayload = {
    id: number | string;
    options?: ItemOptions;
    callback?: () => void;
}

export function dispatchItemAdded(
    item: IFeedbackItemRaw,
    options?: ItemOptions,
    callback?: () => void,
): void {
    document.dispatchEvent(
        new CustomEvent<AddItemPayload>(ITEM_ADDED, {
            detail: {
                item,
                options: options || defaultOptions,
                callback,
            },
        })
    );
}

export function dispatchItemUpdated(
    id: number | string,
    payload: Partial<IFields>,
    options?: ItemOptions,
    callback?: () => void,
): void {
    document.dispatchEvent(
        new CustomEvent<UpdateItemPayload>(ITEM_UPDATED, {
            detail: {
                id,
                payload,
                options: options || defaultOptions,
                callback,
            },
        })
    );
}

export function dispatchItemDeleted(id: number | string, options?: ItemOptions, callback?: () => void): void {
    document.dispatchEvent(
        new CustomEvent<DeletePayload>(ITEM_DELETED, {
            detail: {
                id,
                options: options || defaultOptions,
                callback
            }
        })
    )
}

export function itemAddedEventBuilder(
    itemService: ItemsService,
    tempItemService: TempItemsService,
    cb: (item: Item) => void | Promise<void>
): [string, (ev: CustomEvent) => void, () => void] {
    // Handler receives item's raw details
    const handler = async (ev: CustomEvent<AddItemPayload>): Promise<void> => {
        const doneCb = ev.detail.callback ?? (() => null);
        const options = ev.detail.options;
        const isTemp = options ? options.temp : false;
        const shouldPersist = options ? options.persist : false;
        let resultItem: Item;
        if (!isTemp) {
            const addResults = await itemService.addItem(ev.detail.item);
            resultItem = await itemService.getItem(addResults.data.Id);
        } else {
            const title = ev.detail.item.Title;
            if (shouldPersist) {
                tempItemService.addTempItem(ev.detail.item);
                resultItem = tempItemService.getTempItem(title);
            } else {
                resultItem = new Item(ev.detail.item);
            }
        }
        await cb(resultItem);
        doneCb();
    };

    return [
        ITEM_ADDED,
        handler,
        () => document.removeEventListener(ITEM_ADDED, handler),
    ];
}

export function itemUpdatedEventBuilder(
    itemService: ItemsService,
    tempItemService: TempItemsService,
    indexManager: IndexManager,
    cb: (oldItem: Item, newitem: Item) => void | Promise<void>
): [string, (ev: CustomEvent) => void, () => void] {
    // Handler receives item's raw details
    const handler = async (
        ev: CustomEvent<UpdateItemPayload>
    ): Promise<void> => {
        const doneCb = ev.detail.callback ?? (() => null);

        const options = ev.detail.options;
        const isTemp = options.temp;
        const id = ev.detail.id;
        const shouldPersist = options?.persist ?? false;

        let oldItem: Item;
        let updatedItem: Item;
        if (!isTemp && typeof id === 'number') {
            oldItem = indexManager.filterFirst($eq('id', id.toString()));
            const merged = oldItem.mergeFields(ev.detail.payload);
            await itemService.updateItem(id, merged.asRaw());
            updatedItem = await itemService.getItem(id);
        } else {
            const title = ev.detail.id as string;
            if (typeof id === 'number') {
                oldItem = indexManager.filterFirst($eq('id', id.toString()));
            } else {
                // If it's a temporary item, it doesn't have a numerical Id, it uses the title as such
                oldItem = indexManager.filterFirst($eq('title', title));
            }
            if (shouldPersist) {
                oldItem = tempItemService.getTempItem(title);
                tempItemService.updateItem(title, ev.detail.payload);
                updatedItem = tempItemService.getTempItem(title);
            } else {
                updatedItem = oldItem.mergeFields(ev.detail.payload);
            }
        }
        await cb(oldItem, updatedItem);
        doneCb();
    };

    return [
        ITEM_UPDATED,
        handler,
        () => document.removeEventListener(ITEM_UPDATED, handler),
    ];
}

export function itemDeletedEventBuilder(
    itemService: ItemsService,
    tempItemService: TempItemsService,
    callback: (id: number | string) => void | Promise<void>,
): [string, (ev: CustomEvent) => void, () => void] {
        const handler = async (ev: CustomEvent<DeletePayload>): Promise<void> => {
            const done = ev.detail.callback || (() => null);
            const id = ev.detail.id;
            const isTemp = ev.detail.options.temp;
            const shouldPersist = ev.detail.options.persist;
            if (!isTemp && typeof id === 'number') {
                await itemService.deleteItem(id);
            } else {
                if (shouldPersist) {
                    tempItemService.deleteItem(id.toString());
                }
            }
            await callback(id);
            done();
        };

        return [
            ITEM_DELETED,
            handler,
            () => document.removeEventListener(ITEM_DELETED, handler),
        ]
}
