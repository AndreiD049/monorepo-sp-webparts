import { FIELD_VALUES } from "../webparts/feedback/constants";
import { $eq } from "../webparts/feedback/indexes/filter";
import { IndexManager } from "../webparts/feedback/indexes/index-manager";
import { Item } from "../webparts/feedback/item";
import { dispatchItemAdded, dispatchItemUpdated } from "../webparts/feedback/services/events";

export type FieldSetup = {
        allowNull: boolean;
        allowNewValues: boolean;
        values: string[];
}

export type FieldsSetup = {
    [field: string]: FieldSetup;
}

export function getFieldsSetupId(indexManager: IndexManager): string | number {
    const item = indexManager.filterFirst($eq('title', FIELD_VALUES));
    return item?.Id || null;
}

export function getFieldsSetup(indexManager: IndexManager): FieldsSetup {
    const item = indexManager.filterFirst($eq('title', FIELD_VALUES));
    return item?.Fields as FieldsSetup || null; 
}

// Action
export function saveFieldsSetup(indexManager: IndexManager, newSetup: FieldsSetup): void {
    const setupId = getFieldsSetupId(indexManager);
    if (setupId === null) {
        const newItem = new Item();
        newItem.Fields = { ...newSetup };
        dispatchItemAdded(newItem.asRaw());
    } else {
        dispatchItemUpdated(setupId, newSetup);
    }
}

export function getFieldValues(setup: FieldsSetup, field: string): string[] {
    if (!setup) return [];
    return setup[field]?.values || [];
}

export function isNullAllowed(setup: FieldsSetup, field: string): boolean {
    // By default null is allowed
    if (!setup) return true;
    return setup[field]?.allowNull ?? true;
}

export function canHaveNewValues(setup: FieldsSetup, field: string): boolean {
    // By default fields can have new values
    if (!setup) return true;
    return setup[field]?.allowNewValues ?? true;
}
