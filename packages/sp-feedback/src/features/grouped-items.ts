import { groupBy } from "@microsoft/sp-lodash-subset";
import { Item } from "../webparts/feedback/item";

export type GroupedItems = {
    [group: string]: Item[];
}

export function getGroupedItems(items: Item[], groupField: string): GroupedItems {
    if (!groupField) return null;
    return groupBy(items, (i) => i.getField(groupField));
}

export function getGroupKeys(groups: GroupedItems): string[] {
    return Object.keys(groups);
}
