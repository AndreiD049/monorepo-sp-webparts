import { ITaskOverview } from '@service/sp-cip/dist/models/ITaskOverview';
import { AssigneeSelected } from '../../../components/command-bar/CipAssigneeSelector';
import { StatusSelected } from '../../../components/command-bar/StatusSelector';
import { getNewSorting, ISortedColumn } from './sorting';

export interface ICipFilters {
    search: string;
    assignedTo?: AssigneeSelected;
    status?: StatusSelected;
    facetFilters: { [key: string]: (node: ITaskOverview) => boolean };
    sorting?: ISortedColumn;
}

export interface IFilterAction {
    value?: ((n: ITaskOverview) => boolean) | string | StatusSelected | AssigneeSelected | { [key: string]: (t: ITaskOverview) => boolean };
    type: 'SEARCH' | 'STATUS' | 'ASSIGNED' | 'FACET' | 'FACET_UNSET' | 'SORT';
    column?: string;
}

export const filtersReducer = (state: ICipFilters, action: IFilterAction): ICipFilters => {
    const filters = { ...state.facetFilters };
    switch (action.type) {
        case 'SEARCH':
            return {
                ...state,
                search: action.value as string,
            };
        case 'STATUS':
            return {
                ...state,
                status: action.value as StatusSelected,
            };
        case 'ASSIGNED':
            return {
                ...state,
                assignedTo: action.value as AssigneeSelected,
            };
        case 'FACET':
            return {
                ...state,
                facetFilters: {
                    ...state.facetFilters,
                    [action.column]: action.value,
                } as { [key: string]: (t: ITaskOverview) => boolean },
            };
        case 'FACET_UNSET':
            delete filters[action.column];
            return {
                ...state,
                facetFilters: filters,
            };
        case 'SORT': {
            return {
                ...state,
                sorting: getNewSorting(state.sorting, action.column)
            };
        }
        default:
            throw Error('Unknown action');
    }
};
