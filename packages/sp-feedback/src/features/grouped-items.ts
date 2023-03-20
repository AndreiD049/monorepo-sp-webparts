import { groupBy } from "@microsoft/sp-lodash-subset";
import { Item } from "../webparts/feedback/item";
import { FieldSetup } from "./field-setup";

export type GroupedItems = {
    [group: string]: Item[];
}

export function getGroupedItems(items: Item[], groupField: string, fieldSetup?: FieldSetup): GroupedItems {
    if (!groupField) return null;
    const groups = groupBy(items, (i) => i.getField(groupField));
    if (fieldSetup) {
        fieldSetup.values.forEach((val) => {
            if (!(val in groups)) {
                groups[val] = [];
            }
        })
    }
    return groups;
}

export function getGroupKeys(groups: GroupedItems, fieldSetup?: FieldSetup): string[] {
    if (!groups) return [];
    const keys = Object.keys(groups);
    if (fieldSetup) {
        return Array.from(new Set([...fieldSetup.values, ...keys]));
    }
    return keys;
}
