import * as React from 'react';
import { SAVED_VIEW, SELECTED_VIEW } from '../../constants';
import { $eq } from '../../indexes/filter';
import { Item } from '../../item';
import { dispatchItemAdded, dispatchItemUpdated } from '../../services/events';
import {
    getEmptySelectedView,
    getEmptySelectedViewFields,
    getViewInfo,
} from '../../services/saved-view';
import { GlobalContext } from '../Feedback';
import { SelectDropdown } from '../SelectDropdown';

export interface IFilterDropdownProps {
    // Props go here
}

function getOptions(items: Item[]): Item[] {
    if (items.length === 0) {
        return [new Item().setField('title', 'Default').setField('filter', null)];
    }
    return items;
}

export const FilterDropdown: React.FC<IFilterDropdownProps> = (props) => {
    const { indexManager } = React.useContext(GlobalContext);
    const selectedFilter = React.useMemo(
        () => getViewInfo(indexManager),
        [indexManager]
    );
    const filters: Item[] = React.useMemo(() => {
        return getOptions(indexManager.filterArray($eq('tags', SAVED_VIEW)));
    }, [indexManager]);

    return (
        <SelectDropdown
            target={selectedFilter.tempItem || getEmptySelectedView()}
            field="selected"
            options={filters}
            dropDownProps={{
                placeholder: 'Select filter',
                dropdownWidth: 'auto'
            }}
            onChange={(newFilter) => {
                const options = { temp: true, persist: true };
                if (!selectedFilter.selectedItem) {
                    dispatchItemAdded(
                        getEmptySelectedView(newFilter.getField('selected')).asRaw(),
                        options
                    );
                } else {
                    dispatchItemUpdated(
                        SELECTED_VIEW,
                        getEmptySelectedViewFields(newFilter.getField('selected')),
                        options
                    );
                }
            }}
        />
    );
};
