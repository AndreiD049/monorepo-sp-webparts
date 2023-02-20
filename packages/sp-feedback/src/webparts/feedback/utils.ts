import { IDropdownOption } from "office-ui-fabric-react";
import { Item } from "./item";

export function optionsFromItems(items: Item[]): IDropdownOption[] {
    return items.map((i) => ({
        key: i.getFieldOr<string>('caption', i.Title),
        text: i.getFieldOr<string>('caption', i.Title),
    }));
}