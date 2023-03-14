import { EDITABLE_ITEMS } from '../../constants';
import { $eq } from '../../indexes/filter';
import { IndexManager } from '../../indexes/index-manager';
import { Item } from '../../item';
import { dispatchItemAdded } from '../../services/events';

const filterEditable = $eq('title', EDITABLE_ITEMS);
const defaultEditableItem = () => new Item().setField('title', EDITABLE_ITEMS);

export function isItemEditable(id: number | string, indexManager: IndexManager): boolean {
    return indexManager.filterFirst(filterEditable, defaultEditableItem).getFieldOr(id.toString(), false);
}

export function toggleItemEditable(id: number, indexManager: IndexManager): void {
    const isEditable = isItemEditable(id, indexManager);
    const editableItems = indexManager.filterFirst(
        filterEditable,
        defaultEditableItem
    );
    const updated = editableItems.setField(id.toString(), !isEditable);
    dispatchItemAdded(updated.asRaw(), { temp: true });
}
