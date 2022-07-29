import { TaskNode } from '../../graph/TaskNode';
import { ITaskOverview } from '../../ITaskOverview';
import { ITaskNodeContext } from '../../TaskNodeContext';

export enum SortDirection {
    Ascending,
    Descending,
}

export interface ISortedColumn {
    column: string;
    direction: SortDirection;
}

type SortingMap<T> = Map<SortDirection, (a: T, b: T) => number>;

type SortingFunctionsDict<T> = {
    [key: string]: SortingMap<T>;
};

const textSort = (a: string, b: string) => {
    if (!a) a = '';
    if (!b) b = '';
    const aL = a.toLowerCase();
    const bL = b.toLowerCase();
    if (aL < bL) return -1;
    else if (aL > bL) return 1;
    return 0;
};

const numericSort = (a: number | Date, b: number | Date) => {
    if (a < b) return -1;
    else if (a > b) return 1;
    return 0;
};


/**
 * Creates a map with sorting functions for both sorting directions (asc and desc)
 * For Descendant sorting, just swaps the arguments
 * @param sortFunction sorting function
 * @returns a Map containing a sorting function for both Ascending and Descending sorting
 */
const createMap = <T>(sortFunction: (a: T, b: T) => number): SortingMap<T> => {
    const result = new Map();
    result.set(SortDirection.Ascending, (a, b) => sortFunction(a, b));
    result.set(SortDirection.Descending, (a, b) => sortFunction(b, a));
    return result;
};

export const columnSortFunctionsAsc: SortingFunctionsDict<TaskNode> = {
    Category: createMap((a, b) =>
        textSort(a.getTask().Category, b.getTask().Category)
    ),
    Title: createMap((a, b) => textSort(a.getTask().Title, b.getTask().Title)),
    Priority: createMap((a, b) => {
        const priorityMap = {
            None: 0,
            Low: 1,
            Medium: 2,
            High: 3,
        };
        if (
            priorityMap[a.getTask().Priority] <
            priorityMap[b.getTask().Priority]
        )
            return -1;
        else if (
            priorityMap[a.getTask().Priority] >
            priorityMap[b.getTask().Priority]
        )
            return 1;
        return 0;
    }),
    Responsible: createMap((a, b) =>
        textSort(a.getTask().Responsible.Title, b.getTask().Responsible.Title)),
    Status: createMap((a, b) => textSort(a.getTask().Status, b.getTask().Status)),
    Progress: createMap((a, b) => numericSort(a.getTask().Progress, b.getTask().Progress)),
    DueDate: createMap((a, b) =>
        numericSort(
            new Date(a.getTask().DueDate),
            new Date(b.getTask().DueDate)
        )),
    Team: createMap((a, b) => textSort(a.getTask().Team, b.getTask().Team)),
    Timing: createMap((a, b) =>
        numericSort(a.getTask().EffectiveTime, b.getTask().EffectiveTime)),
};

/**
 * @param sorting current column sorting (contains the column and direction)
 * @param showCategories whether rows are greouped by category 
 * @returns a function that can be passed to `sort`
 */
export const getColumnSortingFunc = (
    sorting: ISortedColumn,
    showCategories: boolean
): ((a: TaskNode, b: TaskNode) => number) => {
    if (!sorting && showCategories) {
        return columnSortFunctionsAsc['Category'].get(SortDirection.Ascending);
    } else if (sorting && !showCategories) {
        return columnSortFunctionsAsc[sorting.column]?.get(sorting.direction) || ((_a, _b) => 0);
    } else if (sorting && showCategories) {
        return (a: TaskNode, b: TaskNode) => {
            const categorySortValue = columnSortFunctionsAsc['Category'].get(SortDirection.Ascending)(a, b);
            if (categorySortValue != 0) return categorySortValue;
            return columnSortFunctionsAsc[sorting.column].get(sorting.direction)(a, b);
        };
    }
    // leave the sorting as it is
    return (_a: TaskNode, _b: TaskNode) => 0;
};

const nextSorting = (sorting: ISortedColumn) => {
    if (sorting.direction === SortDirection.Ascending) {
        return {
            ...sorting,
            direction: SortDirection.Descending,
        };
    }
    return null;
};

export const getNewSorting = (
    prevSorting: ISortedColumn,
    newSortedColumn: string
): ISortedColumn => {
    if (!prevSorting || prevSorting.column !== newSortedColumn) {
        return {
            column: newSortedColumn,
            direction: SortDirection.Ascending,
        };
    }
    // Same column
    return nextSorting(prevSorting);
};
