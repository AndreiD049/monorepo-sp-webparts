import { Item } from "../item";

export const ITEM_ADDED = 'spfxFeedback/ItemAdded';

export const itemAdded = (item: Item): void => {
    document.dispatchEvent(new CustomEvent<Item>(ITEM_ADDED, {
        detail: item,
    }));
}