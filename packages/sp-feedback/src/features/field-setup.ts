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

function emptySetup(): FieldSetup {
    return {
        values: [],
        allowNull: true,
        allowNewValues: true,
    }
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
        const newItem = new Item()
            .setTitle(FIELD_VALUES);
        newItem.Fields = { ...newSetup };
        dispatchItemAdded(newItem.asRaw());
    } else {
        dispatchItemUpdated(setupId, newSetup);
    }
}

export function getFieldSetup(indexManager: IndexManager, field: string): FieldSetup {
    const setup = getFieldsSetup(indexManager);
    const empty = emptySetup();
    if (!setup) return empty;
    if (!Object.prototype.hasOwnProperty.call(setup, field)) return empty;
    return Object.assign(empty, setup[field]);
}
