import * as React from 'react';
import { FILTER, SELECTED_FILTER } from '../../constants';
import { $eq } from '../../indexes/filter';
import { Item } from '../../item';
import { dispatchItemAdded, dispatchItemUpdated } from '../../services/events';
import {
    getNewSelectedFilter,
    getSelectedFilterInfo,
} from '../../services/saved-filter';
import { GlobalContext } from '../Feedback';
import { SelectDropdown } from '../SelectDropdown';

export interface IFilterDropdownProps {
    // Props go here
}

export const FilterDropdown: React.FC<IFilterDropdownProps> = (props) => {
    const { indexManager } = React.useContext(GlobalContext);
    const selectedFilter = React.useMemo(
        () => getSelectedFilterInfo(indexManager),
        [indexManager]
    );
    const filters: Item[] = React.useMemo(() => {
        return indexManager.filterArray($eq('tags', FILTER));
    }, [indexManager]);

    return (
        <SelectDropdown
            target={selectedFilter.tempItem || getNewSelectedFilter('', null)}
            field="selected"
            options={filters}
            dropDownProps={{
                placeholder: 'Select filter',
            }}
            onChange={(newFilter) => {
                const options = { temp: true, persist: true };
                if (!selectedFilter.selectedItem) {
                    dispatchItemAdded(
                        newFilter
                            .setTitle(SELECTED_FILTER)
                            .unsetField('filter')
                            .asRaw(),
                        options
                    );
                } else {
                    dispatchItemUpdated(
                        SELECTED_FILTER,
                        newFilter.unsetField('filter'),
                        options
                    );
                }
            }}
        />
    );
};
