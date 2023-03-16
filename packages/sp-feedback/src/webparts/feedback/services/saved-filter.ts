import { IFields } from '../../../models/IFeedbackItem';
import { FILTER, SELECTED_FILTER } from '../constants';
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
    /* modified fields */
    filterModified: boolean;
};

const emptyFilterInfo: SelectedFilterInfo = {
    tempItem: null,
    selectedTitle: null,
    selectedItem: null,
    appliedFilter: null,
    appliedSortField: null,
    appliedSortAsc: true,
    appliedGroupField: null,
    filterModified: false,
};

export function getEmptySelectedFilter(selectedName?: string): Item {
    const result = new Item()
        .setField('title', SELECTED_FILTER)
        .setField('isservice', true)
    result.Fields = getEmptySelectedFilterFields(selectedName);
    return result;
}

export function changeFilter(selectedFilterItem: Item, filter: Filter): Item {
    return selectedFilterItem.setField('filter', filter);
}

export function changeSort(selectedFilterItem: Item, sortField: string | number, ascending: boolean): Item {
    return selectedFilterItem.setField('sort', sortField)
        .setField('sortdir', ascending ? 'asc' : 'desc');
}

export function changeGroup(selectedFilterItem: Item, groupField: string | number): Item {
    return selectedFilterItem.setField('group', groupField);
}

export function getEmptySelectedFilterFields(selectedName?: string): IFields {
    return {
        selected: selectedName,
        filter: undefined,
        sort: undefined,
        group: undefined,
    }
}

export function getNewSavedFilterItem(title: string, filterInfo: SelectedFilterInfo): Item {
    const item = new Item()
        .setField('title', title)
        .setTags([FILTER])
        .setField('isservice', true)
        .setField('filter', filterInfo.appliedFilter)
        .setField('sort', filterInfo.appliedSortField)
        .setField('sortdir', filterInfo.appliedSortAsc ? 'asc' : 'desc')
        .setField('group', filterInfo.appliedGroupField);
    return item;
}

export function getSelectedFilterInfo(
    indexManager: IndexManager
): SelectedFilterInfo {
    const result: SelectedFilterInfo = { ...emptyFilterInfo };
    result.tempItem = indexManager.filterFirst($eq('title', SELECTED_FILTER));
    if (!result.tempItem) return result;
    // Any changes to the filters applied by user?
    result.appliedFilter = result.tempItem.getFieldOr('filter', undefined);

    result.appliedSortField = result.tempItem.getFieldOr('sort', undefined);
    result.appliedSortAsc = result.tempItem.getField('sortdir') === 'asc';

    result.appliedGroupField = result.tempItem.getFieldOr('group', undefined);
    // Was the filter modified?
    result.filterModified =
        result.appliedFilter !== undefined ||
        result.appliedSortField !== undefined ||
        result.appliedGroupField !== undefined;

    result.selectedTitle = result.tempItem.getField('selected');
    if (!result.selectedTitle) return result;
    // If no changes, get filter/sort/group from selected item
    result.selectedItem = indexManager.filterFirst(
        $eq('title', result.selectedTitle)
    );
    if (!result.selectedItem) {
        result.selectedTitle = null;
        return result;
    }
    if (result.appliedFilter === undefined) {
        result.appliedFilter = result.selectedItem.getField('filter');
    }
    if (result.appliedSortField === undefined) {
        result.appliedSortField = result.selectedItem.getField('sort');
        result.appliedSortAsc =
            result.selectedItem.getField('sortdir') === 'asc';
    }
    if (result.appliedGroupField === undefined) {
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
