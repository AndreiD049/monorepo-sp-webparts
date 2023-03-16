import { IFields } from '../../../models/IFeedbackItem';
import { SINGLE_COL } from '../components/LayoutSelect';
import { SAVED_VIEW, SELECTED_VIEW } from '../constants';
import { $eq, Filter } from '../indexes/filter';
import { IndexManager } from '../indexes/index-manager';
import { Item } from '../item';

export type SelectedViewInfo = {
    tempItem: Item;
    selectedItem: Item;
    selectedTitle: string;
    appliedFilter: Filter;
    appliedSortField: string;
    appliedSortAsc: boolean;
    appliedGroupField: string;
    appliedLayout: string;
    /* modified fields */
    filterModified: boolean;
};

const emptyViewInfo: SelectedViewInfo = {
    tempItem: null,
    selectedTitle: null,
    selectedItem: null,
    appliedFilter: null,
    appliedSortField: null,
    appliedSortAsc: true,
    appliedGroupField: null,
    appliedLayout: SINGLE_COL, //default
    filterModified: false,
};

export function getEmptySelectedView(selectedName?: string): Item {
    const result = new Item()
        .setField('title', SELECTED_VIEW)
        .setField('isservice', true)
    result.Fields = getEmptySelectedViewFields(selectedName);
    return result;
}

export function changeFilter(selectedViewItem: Item, filter: Filter): Item {
    return selectedViewItem.setField('filter', filter);
}

export function changeSort(selectedViewItem: Item, sortField: string | number, ascending: boolean): Item {
    return selectedViewItem.setField('sort', sortField)
        .setField('sortdir', ascending ? 'asc' : 'desc');
}

export function changeGroup(selectedViewItem: Item, groupField: string | number): Item {
    return selectedViewItem.setField('group', groupField);
}

export function changeLayout(selectedViewItem: Item, layout: string): Item {
    return selectedViewItem.setField('layout', layout);
}

export function getEmptySelectedViewFields(selectedName?: string): IFields {
    return {
        selected: selectedName,
        filter: undefined,
        sort: undefined,
        group: undefined,
        layout: undefined,
    }
}

export function makeViewItem(title: string, filterInfo: SelectedViewInfo): Item {
    const item = new Item()
        .setField('title', title)
        .setTags([SAVED_VIEW])
        .setField('isservice', true)
        .setField('filter', filterInfo.appliedFilter)
        .setField('sort', filterInfo.appliedSortField)
        .setField('sortdir', filterInfo.appliedSortAsc ? 'asc' : 'desc')
        .setField('group', filterInfo.appliedGroupField)
        .setField('layout', filterInfo.appliedLayout);
    return item;
}

export function getViewInfo(
    indexManager: IndexManager
): SelectedViewInfo {
    const result: SelectedViewInfo = { ...emptyViewInfo };
    result.tempItem = indexManager.filterFirst($eq('title', SELECTED_VIEW));
    if (!result.tempItem) return result;
    // Any changes to the filters applied by user?
    result.appliedFilter = result.tempItem.getFieldOr('filter', undefined);

    result.appliedSortField = result.tempItem.getFieldOr('sort', undefined);
    result.appliedSortAsc = result.tempItem.getField('sortdir') === 'asc';

    result.appliedGroupField = result.tempItem.getFieldOr('group', undefined);

    result.appliedLayout = result.tempItem.getFieldOr('layout', undefined);

    // Was the filter modified?
    result.filterModified =
        result.appliedFilter !== undefined ||
        result.appliedSortField !== undefined ||
        result.appliedGroupField !== undefined ||
        result.appliedLayout !== undefined;

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
    if (result.appliedLayout === undefined) {
        result.appliedLayout = result.selectedItem.getFieldOr('layout', SINGLE_COL);
    }

    return result;
}

export function getSortingFunction(
    selected: SelectedViewInfo
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
