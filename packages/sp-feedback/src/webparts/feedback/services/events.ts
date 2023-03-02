import { IFeedbackItemRaw } from '../../../models/IFeedbackItem';
import { ItemsService } from '../../../services/items-service';
import { TempItemsService } from '../../../services/temp-items-service';
import { Item } from '../item';

export const ITEM_ADDED = 'spfxFeedback/ItemAdded';

type AddItemOptions = {
    temp: boolean;
    persist?: boolean;
}

type AddItemPayload = {
    item: IFeedbackItemRaw;
    options?: AddItemOptions;
}

export function dispatchItemAdded(item: IFeedbackItemRaw, options?: AddItemOptions): void {
    document.dispatchEvent(
        new CustomEvent<AddItemPayload>(ITEM_ADDED, {
            detail: {
                item,
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
                await tempItemService.addTempItem(ev.detail.item);
            }
            resultItem = await tempItemService.getTempItem(title);
        }
        cb(resultItem);
    };

    return [
        ITEM_ADDED,
        handler,
        () => document.removeEventListener(ITEM_ADDED, handler),
    ];
}