import * as React from 'react';
import { FILTER, SELECTED_FILTER } from '../../constants';
import { $eq } from '../../indexes/filter';
import { Item } from '../../item';
import { dispatchItemAdded } from '../../services/events';
import { MainService } from '../../services/main-service';
import { GlobalContext } from '../Feedback';
import { SelectDropdown } from '../SelectDropdown';

export interface IFilterDropdownProps {
    // Props go here
}

export const FilterDropdown: React.FC<IFilterDropdownProps> = (props) => {
    const { indexManager } = React.useContext(GlobalContext);
    const selectedFilter = React.useMemo(() => {
        const selected = MainService.TempItemService.getTempItem(SELECTED_FILTER);
        return selected || new Item().setTitle(SELECTED_FILTER);
    }, [indexManager]);
    const filters: Item[] = React.useMemo(() => {
        return indexManager.filterArray($eq('tags', FILTER));
    }, [indexManager]);

    return (
        <SelectDropdown 
            target={selectedFilter}
            field="selected"
            options={filters}
            onChange={(newFilter) => dispatchItemAdded(newFilter.asRaw(), {
                temp: true,
                persist: true,
            })}
        />
    );
};
