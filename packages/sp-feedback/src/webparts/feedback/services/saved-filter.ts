import { SELECTED_FILTER } from '../constants';
import { $eq, Filter } from '../indexes/filter';
import { IndexManager } from '../indexes/index-manager';
import { Item } from '../item';

export type SelectedFilterInfo = {
    tempItem: Item;
    selectedItem: Item;
    selectedTitle: string;
    appliedFilter: Filter;
    appliedSortField: string;
    appliedSortAsc: boolean;
    appliedGroupField: string;
};

const emptyFilterInfo: SelectedFilterInfo = {
    tempItem: null,
    selectedTitle: null,
    selectedItem: null,
    appliedFilter: null,
    appliedSortField: null,
    appliedSortAsc: true,
    appliedGroupField: null,
};

export function getNewSelectedFilter(
    selected: string,
    filter: Filter,
    sort?: string,
    sortAsc?: boolean,
    group?: string
): Item {
    let result = new Item()
        .setTitle(SELECTED_FILTER)
        .setField('selected', selected)
        .setField('isservice', true);
    if (filter) {
        result = result.setField('filter', filter);
    }
    if (sort) {
        result = result
            .setField('sort', sort)
            .setField('sortdir', sortAsc ? 'asc' : 'desc');
    }
    if (group) {
        result = result.setField('group', group);
    }
    return result;
}

export function getSelectedFilterInfo(
    indexManager: IndexManager
): SelectedFilterInfo {
    const result: SelectedFilterInfo = { ...emptyFilterInfo };
    result.tempItem = indexManager.filterFirst($eq('title', SELECTED_FILTER));
    if (!result.tempItem) return result;
    result.appliedFilter = result.tempItem.getField('filter');
    result.appliedSortField = result.tempItem.getField('sort');
    result.appliedSortAsc = result.tempItem.getField('sortdir') === 'asc';
    result.appliedGroupField = result.tempItem.getField('group');

    result.selectedTitle = result.tempItem.getField('selected');
    if (!result.selectedTitle) return result;
    result.selectedItem = indexManager.filterFirst(
        $eq('title', result.selectedTitle)
    );
    if (!result.appliedFilter) {
        result.appliedFilter = result.selectedItem.getField('filter');
    }
    if (!result.appliedSortField) {
        result.appliedSortField = result.selectedItem.getField('sort');
        result.appliedSortAsc =
            result.selectedItem.getField('sortdir') === 'asc';
    }
    if (!result.appliedGroupField) {
        result.appliedGroupField = result.selectedItem.getField('group');
    }

    return result;
}

export function getSortingFunction(
    selected: SelectedFilterInfo
): (i: Item, i2: Item) => number {
    if (!selected.appliedSortField) return () => 0;
    return (item1: Item, item2: Item) => {
        let value1 = item1.getField(selected.appliedSortField);
        let value2 = item2.getField(selected.appliedSortField);
        if (!selected.appliedSortAsc) {
            const temp = value1;
            value1 = value2;
            value2 = temp;
        }
        return value1 < value2 ? -1 : value1 === value2 ? 0 : 1;
    };
}
