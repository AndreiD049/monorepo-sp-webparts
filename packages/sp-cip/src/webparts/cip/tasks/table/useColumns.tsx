import { ColumnActionsMode, IColumn } from 'office-ui-fabric-react';
import * as React from 'react';
import { calloutVisibility } from '../../utils/dom-events';
import { TaskNode } from '../graph/TaskNode';
import { ChoiceFacet, IChoiceFacetProps } from './ChoiceFacet';
import { ICipFilters, IFilterAction } from './filters-reducer';

export const useColumns = (tree: TaskNode, filters: ICipFilters, dispatch: React.Dispatch<IFilterAction>) => {
    const nodes = React.useMemo(() => tree.getChildren(), [tree])

    const columns: IColumn[] = [
        {
            key: 'Title',
            name: 'Title',
            fieldName: 'Title',
            minWidth: 500,
            isResizable: true,
            isFiltered: Boolean(filters.facetFilters['Title']),
            columnActionsMode: ColumnActionsMode.hasDropdown,
            onColumnContextMenu: (col, ev) => {
                calloutVisibility<IChoiceFacetProps>({
                    visible: true,
                    isBeakVisible: false,
                    target: ev.currentTarget as any,
                    gapSpace: 3,
                    RenderComponent: ChoiceFacet,
                    componentProps: {
                        options: nodes,
                        getValue: (n) => n.getTask().Title,
                        onFacetSet: (options) => dispatch({ type: 'FACET', value: (n: TaskNode) => options.has(n.getTask().Title), column: 'Title' }),
                        onFacetUnset: () => dispatch({ type: 'FACET_UNSET', value: null, column: 'Title' }),
                        column: col,
                    }
                });
            },
        },
        {
            key: 'Actions',
            name: 'Actions',
            fieldName: 'Actions',
            minWidth: 150,
            onColumnContextMenu: () => null,
        },
        {
            key: 'Priority',
            name: 'Priority',
            fieldName: 'Priority',
            minWidth: 100,
            isFiltered: Boolean(filters.facetFilters['Priority']),
            columnActionsMode: ColumnActionsMode.hasDropdown,
            onColumnContextMenu: (col, ev) => {
                calloutVisibility<IChoiceFacetProps>({
                    visible: true,
                    isBeakVisible: false,
                    target: ev.currentTarget as any,
                    gapSpace: 3,
                    RenderComponent: ChoiceFacet,
                    componentProps: {
                        options: nodes,
                        getValue: (n) => n.getTask().Priority,
                        onFacetSet: (options) => dispatch({ type: 'FACET', value: (n: TaskNode) => options.has(n.getTask().Priority), column: 'Priority' }),
                        onFacetUnset: () => dispatch({ type: 'FACET_UNSET', value: null, column: 'Priority' }),
                        column: col,
                    }
                });
            },
        },
        {
            key: 'Responsible',
            name: 'Responsible',
            fieldName: 'Responsible',
            minWidth: 150,
            isFiltered: Boolean(filters.facetFilters['Responsible']),
            columnActionsMode: ColumnActionsMode.hasDropdown,
            onColumnContextMenu: (col, ev) => {
                calloutVisibility<IChoiceFacetProps>({
                    visible: true,
                    isBeakVisible: false,
                    target: ev.currentTarget as any,
                    gapSpace: 3,
                    RenderComponent: ChoiceFacet,
                    componentProps: {
                        options: nodes,
                        getValue: (n) => n.getTask().Responsible.Title,
                        onFacetSet: (options) => dispatch({ type: 'FACET', value: (n: TaskNode) => options.has(n.getTask().Responsible.Title), column: 'Responsible' }),
                        onFacetUnset: () => dispatch({ type: 'FACET_UNSET', value: null, column: 'Responsible' }),
                        column: col,
                    }
                });
            },
        },
        {
            key: 'Status',
            name: 'Status',
            fieldName: 'Status',
            isFiltered: Boolean(filters.facetFilters['Status']),
            columnActionsMode: ColumnActionsMode.hasDropdown,
            onColumnContextMenu: (col, ev) => {
                calloutVisibility<IChoiceFacetProps>({
                    visible: true,
                    isBeakVisible: false,
                    target: ev.currentTarget as any,
                    gapSpace: 3,
                    RenderComponent: ChoiceFacet,
                    componentProps: {
                        options: nodes,
                        getValue: (n) => n.getTask().Status,
                        onFacetSet: (options) => dispatch({ type: 'FACET', value: (n: TaskNode) => options.has(n.getTask().Status), column: 'Status' }),
                        onFacetUnset: () => dispatch({ type: 'FACET_UNSET', value: null, column: 'Status' }),
                        column: col,
                    }
                });
            },
            minWidth: 100,
        },
        {
            key: 'Progress',
            name: 'Progress',
            fieldName: 'Progress',
            minWidth: 100,
            onColumnContextMenu: () => null,
        },
        {
            key: 'DueDate',
            name: 'Due Date',
            fieldName: 'DueDate',
            minWidth: 100,
            onColumnContextMenu: () => null,
        },
        {
            key: 'Team',
            name: 'Team',
            fieldName: 'Team',
            isFiltered: Boolean(filters.facetFilters['Team']),
            columnActionsMode: ColumnActionsMode.hasDropdown,
            onColumnContextMenu: (col, ev) => {
                calloutVisibility<IChoiceFacetProps>({
                    visible: true,
                    isBeakVisible: false,
                    target: ev.currentTarget as any,
                    gapSpace: 3,
                    RenderComponent: ChoiceFacet,
                    componentProps: {
                        options: nodes,
                        getValue: (n) => n.getTask().Team,
                        onFacetSet: (options) => dispatch({ type: 'FACET', value: (n: TaskNode) => options.has(n.getTask().Team), column: 'Team' }),
                        onFacetUnset: () => dispatch({ type: 'FACET_UNSET', value: null, column: 'Team' }),
                        column: col,
                    }
                });
            },
            minWidth: 100,
        },
        {
            key: 'Timing',
            name: 'Timing',
            fieldName: 'Timing',
            minWidth: 200,
            onColumnContextMenu: () => null,
        },
    ];

    return { columns };
};
