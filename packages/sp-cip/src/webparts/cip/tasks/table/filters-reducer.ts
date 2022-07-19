import {
    AssigneeSelected,
    StatusSelected,
} from '../../components/CipCommandBar';
import { TaskNode } from '../graph/TaskNode';

export interface ICipFilters {
    search: string;
    assignedTo?: AssigneeSelected;
    status?: StatusSelected;
    facetFilters: { [key: string]: (node: TaskNode) => boolean };
}

export interface IFilterAction {
    value: any;
    type: 'SEARCH' | 'STATUS' | 'ASSIGNED' | 'FACET' | 'FACET_UNSET';
    column?: string;
}

export const filtersReducer = (state: ICipFilters, action: IFilterAction) => {
    switch (action.type) {
        case 'SEARCH':
            return {
                ...state,
                search: action.value,
            };
        case 'STATUS':
            return {
                ...state,
                status: action.value,
            };
        case 'ASSIGNED':
            return {
                ...state,
                assignedTo: action.value,
            };
        case 'FACET':
            return {
                ...state,
                facetFilters: {
                    ...state.facetFilters,
                    [action.column]: action.value,
                },
            };
        case 'FACET_UNSET':
            const filters = { ...state.facetFilters };
            delete filters[action.column];
            return {
                ...state,
                facetFilters: filters,
            };
        default:
            throw Error('Unknown action');
    }
};
