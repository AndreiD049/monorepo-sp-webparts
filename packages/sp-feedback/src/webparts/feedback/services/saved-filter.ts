import { SELECTED_FILTER } from '../constants';
import { $eq, Filter } from '../indexes/filter';
import { IndexManager } from '../indexes/index-manager';
import { Item } from '../item';

type SelectedFilterInfo = {
    item: Item;
    selectedTitle: string;
    selected: Item;
    initialFilter: Filter;
    currentFilter: Filter;
}

const emptyFilterInfo: SelectedFilterInfo = {
    item: null,
    selectedTitle: null,
    selected: null,
    currentFilter: null,
    initialFilter: null,
};

export function getNewSelectedFilter(selected: string, filter: Filter): Item {
    let result = new Item().setTitle(SELECTED_FILTER).setField('selected', selected);
    if (filter) {
        result = result.setField('filter', filter);
    }
    return result;
}


export function getSelectedFilterInfo(indexManager: IndexManager): SelectedFilterInfo {
    const result: SelectedFilterInfo = {...emptyFilterInfo};
    result.item = indexManager.filterFirst($eq('title', SELECTED_FILTER));
    if (!result.item) return result;
    result.currentFilter = result.item.getField('filter');
    result.selectedTitle = result.item.getField('selected');
    if (!result.selectedTitle) return result;
    result.selected = indexManager.filterFirst($eq('title', result.selectedTitle));
    result.initialFilter = result.selected.getField('filter');
    return result;
}

// If i have a currentFilter, means my initial filter was modified and i need to
// apply the modified version
export function getFilterApplied(selected: SelectedFilterInfo): Filter {
    return selected.currentFilter || selected.initialFilter;
}
