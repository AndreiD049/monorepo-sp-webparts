import { TaskNode } from '../../graph/TaskNode';

export enum SortDirection {
    Ascending,
    Descending,
}

export interface ISortedColumn {
    column: string;
    direction: SortDirection;
}

type SortingFunctionsDict<T> = {
    [key: string]: (dir: SortDirection) => (a: T, b: T) => number;
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

export const columnSortFunctions: SortingFunctionsDict<TaskNode> = {
    Category: (dir) => (a, b) => {
        if (dir === SortDirection.Descending) {
            return textSort(b.getTask().Category, a.getTask().Category);
        }
        return textSort(a.getTask().Category, b.getTask().Category);
    },
    Title: (dir) => (a, b) => {
        if (dir === SortDirection.Descending) {
            return textSort(b.getTask().Title, a.getTask().Title);
        }
        return textSort(a.getTask().Title, b.getTask().Title);
    },
    Priority: (dir) => (a, b) => {
        const priorityMap = {
            None: 0,
            Low: 1,
            Medium: 2,
            High: 3,
        };
        const isAsc = dir === SortDirection.Ascending;
        if (
            priorityMap[a.getTask().Priority] <
            priorityMap[b.getTask().Priority]
        )
            return isAsc ? -1 : 1;
        else if (
            priorityMap[a.getTask().Priority] >
            priorityMap[b.getTask().Priority]
        )
            return isAsc ? 1 : -1;
        return 0;
    },
    Responsible: (dir) => (a, b) => {
        if (dir === SortDirection.Descending) {
            return textSort(
                b.getTask().Responsible.Title,
                a.getTask().Responsible.Title
            );
        }
        return textSort(
            a.getTask().Responsible.Title,
            b.getTask().Responsible.Title
        );
    },
    Status: (dir) => (a, b) => {
        if (dir === SortDirection.Descending) {
            return textSort(b.getTask().Status, a.getTask().Status);
        }
        return textSort(a.getTask().Status, b.getTask().Status);
    },
    Progress: (dir) => (a, b) => {
        if (dir === SortDirection.Descending) {
            return numericSort(b.getTask().Progress, a.getTask().Progress);
        }
        return numericSort(a.getTask().Progress, b.getTask().Progress);
    },
    DueDate: (dir) => (a, b) => {
        if (dir === SortDirection.Descending) {
            return numericSort(
                new Date(b.getTask().DueDate),
                new Date(a.getTask().DueDate)
            );
        }
        return numericSort(
            new Date(a.getTask().DueDate),
            new Date(b.getTask().DueDate)
        );
    },
    Team: (dir) => {
        if (dir === SortDirection.Descending) {
            return (a, b) => textSort(b.getTask().Team, a.getTask().Team);
        }
        return (a, b) => textSort(a.getTask().Team, b.getTask().Team);
    },
    Timing: (dir) => (a, b) => {
        if (dir === SortDirection.Descending) {
            return numericSort(
                b.getTask().EffectiveTime,
                a.getTask().EffectiveTime
            );
        }
        return numericSort(
            a.getTask().EffectiveTime,
            b.getTask().EffectiveTime
        );
    },
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
        return columnSortFunctions.Category(SortDirection.Ascending);
    } else if (sorting && !showCategories) {
        return (
            (columnSortFunctions[sorting.column] &&
                columnSortFunctions[sorting.column](sorting.direction)) ||
            ((_a, _b) => 0)
        );
    } else if (sorting && showCategories) {
        return (a: TaskNode, b: TaskNode) => {
            const categorySortValue = columnSortFunctions.Category(
                SortDirection.Ascending
            )(a, b);
            if (categorySortValue != 0) return categorySortValue;
            return columnSortFunctions[sorting.column](sorting.direction)(a, b);
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
