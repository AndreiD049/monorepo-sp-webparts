import {
    AssigneeSelected,
    StatusSelected,
} from '../../components/CipCommandBar';

export const SEARCH = 'SEARCH';
export const STATUS = 'STATUS';

export interface ICipFilters {
    search: string;
    assignedTo: AssigneeSelected;
    status: StatusSelected;
}

export const filtersReducer = (state: ICipFilters, action: any) => {
    switch (action.type) {
        case SEARCH:
            return {
                ...state,
                search: action.value,
            };
        case STATUS:
            return {
                ...state,
                status: action.value,
            };
        default:
            throw Error('Unknown action');
    }
};
