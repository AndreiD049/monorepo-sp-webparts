import * as React from 'react';
import { ITaskOverview } from '@service/sp-cip/dist/models/ITaskOverview';
import { createTaskTree } from '../../graph/factory';
import { TaskNode } from '../../graph/TaskNode';
import { ICipFilters } from './filters-reducer';
import { getColumnSortingFunc } from './sorting';

const searchFunc = (task: ITaskOverview, search: string): boolean => {
    const nSearch = search.toLowerCase();
    return (
        task.Title.toLowerCase().includes(nSearch) ||
        task.Description?.toLowerCase().includes(nSearch)
    );
};

export const useFilteredTree = (
    tasks: ITaskOverview[],
    filters: ICipFilters,
    showCategories: boolean
): { tree: TaskNode, filteredTasks: ITaskOverview[] } => {
	const [filteredTasks, setFilteredTasks] = React.useState<ITaskOverview[]>([]);
    const tree = React.useMemo(() => {
		let result = tasks;
        if (filters.search && filters.search.length > 0) {
            result = result.filter((n: ITaskOverview) => searchFunc(n, filters.search));
        }
		setFilteredTasks(result);
        const facetFilters = Object.values(filters.facetFilters);
        if (facetFilters.length && facetFilters.length > 0) {
            result = result.filter((task) => facetFilters.every((filter) => filter(task)));
        }
        return createTaskTree(result);
    }, [tasks, filters]);


    const sortedTree = React.useMemo(() => {
        const children = tree.getChildren()
        children.sort(getColumnSortingFunc(filters.sorting, showCategories));
        return tree.clone().withChildren(children);
    }, [tree, filters, showCategories]);

    return {
        tree: sortedTree,
		filteredTasks
    };
};
