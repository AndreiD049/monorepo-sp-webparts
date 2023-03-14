import { IFeedbackItem, IFeedbackItemRaw } from '../../../models/IFeedbackItem';
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

type AddItemPayload = {
    item: IFeedbackItemRaw;
    options?: ItemOptions;
};

type UpdateItemPayload = {
    id: number | string;
    payload: Partial<IFeedbackItem>;
    options?: ItemOptions;
};

export function dispatchItemAdded(
    item: IFeedbackItemRaw,
    options?: ItemOptions
): void {
    document.dispatchEvent(
        new CustomEvent<AddItemPayload>(ITEM_ADDED, {
            detail: {
                item,
                options,
            },
        })
    );
}

export function dispatchItemUpdated(
    id: number | string,
    payload: Partial<IFeedbackItem>,
    options?: ItemOptions
): void {
    document.dispatchEvent(
        new CustomEvent<UpdateItemPayload>(ITEM_UPDATED, {
            detail: {
                id,
                payload,
                options,
            },
        })
    );
}

export function itemAddedEventBuilder(
    itemService: ItemsService,
    tempItemService: TempItemsService,
    cb: (item: Item) => void
): [string, (ev: CustomEvent) => void, () => void] {
    // Handler receives item's raw details
    const handler = async (ev: CustomEvent<AddItemPayload>): Promise<void> => {
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
        cb(resultItem);
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
    cb: (oldItem: Item, newitem: Item) => void
): [string, (ev: CustomEvent) => void, () => void] {
    // Handler receives item's raw details
    const handler = async (
        ev: CustomEvent<UpdateItemPayload>
    ): Promise<void> => {
        const options = ev.detail.options;
        const isTemp = options.temp;
        const id = ev.detail.id;
        const shouldPersist = options?.persist ?? false;
        let oldItem: Item;
        let updatedItem: Item;
        if (!isTemp && typeof id === 'number') {
            // ! TODO: optimize this, it should not do so many calls
            oldItem = await itemService.getItem(id);
            const merged = oldItem.merge(ev.detail.payload);
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
                updatedItem = oldItem.merge(ev.detail.payload);
            }
        }
        cb(oldItem, updatedItem);
    };

    return [
        ITEM_UPDATED,
        handler,
        () => document.removeEventListener(ITEM_UPDATED, handler),
    ];
}
