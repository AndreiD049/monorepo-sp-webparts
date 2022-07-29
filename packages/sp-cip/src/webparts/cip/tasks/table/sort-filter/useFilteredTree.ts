import * as React from 'react';
import { createTaskTree } from '../../graph/factory';
import { TaskNode } from '../../graph/TaskNode';
import { ITaskOverview } from '../../ITaskOverview';
import { ICipFilters } from './filters-reducer';
import { getColumnSortingFunc } from './sorting';

const searchFunc = (node: TaskNode, search: string) => {
    const task = node.getTask();
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
) => {
    const tree = React.useMemo(() => {
        return createTaskTree(tasks);
    }, [tasks, filters]);

    const filteredTree = React.useMemo(() => {
        let result = tree;
        if (filters.search && filters.search.length > 0) {
            result = result.filter((n: TaskNode) => searchFunc(n, filters.search));
        }
        const facetFilters = Object.values(filters.facetFilters);
        if (facetFilters.length && facetFilters.length > 0) {
            result = result.hide(facetFilters);
        }
        return result.clone();
    }, [tree, filters]);


    const sortedTree = React.useMemo(() => {
        const children = filteredTree.getChildren()
        children.sort(getColumnSortingFunc(filters.sorting, showCategories));
        return filteredTree.clone().withChildren(children);
    }, [filteredTree, filters, showCategories]);

    return {
        tree: sortedTree,
    };
};
