import * as React from 'react';
import { createTaskTree } from '../graph/factory';
import { TaskNode } from '../graph/TaskNode';
import { ITaskOverview } from '../ITaskOverview';
import { ICipFilters } from './filters-reducer';

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
    filters: ICipFilters
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
        const children = filteredTree
            .getChildren()
            .sort((a, b) => (a.Category < b.Category) ? -1 : 1);
        return filteredTree.clone().withChildren(children);
    }, [filteredTree]);

    return {
        tree: sortedTree,
    };
};
