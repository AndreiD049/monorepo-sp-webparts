import { ColumnActionsMode, IColumn } from 'office-ui-fabric-react';
import * as React from 'react';
import { calloutVisibility } from '../../utils/dom-events';
import { TaskNode } from '../graph/TaskNode';
import { ChoiceFacet, IChoiceFacetProps } from './facet/ChoiceFacet';
import { ICipFilters, IFilterAction } from './sort-filter/filters-reducer';
import { ISortedColumn, SortDirection } from './sort-filter/sorting';

const isSorted = (column: string, sorting: ISortedColumn) =>
    sorting?.column === column;
const isSortedDescending = (column: string, sorting: ISortedColumn) =>
    isSorted(column, sorting) && sorting?.direction === SortDirection.Descending;

export const useColumns = (
    tree: TaskNode,
    filters: ICipFilters,
    dispatch: React.Dispatch<IFilterAction>
) => {
    const nodes = React.useMemo(() => tree.getChildren(), [tree]);

    const columns: IColumn[] = React.useMemo(
        () => [
            {
                key: 'Title',
                name: 'Title',
                fieldName: 'Title',
                minWidth: 500,
                isResizable: true,
                isFiltered: Boolean(filters.facetFilters['Title']),
                isSorted: isSorted('Title', filters.sorting),
                isSortedDescending: isSortedDescending('Title', filters.sorting),
                onColumnClick: () => dispatch({ type: 'SORT', column: 'Title' }),
                columnActionsMode: ColumnActionsMode.clickable,
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
                            onFacetSet: (options) =>
                                dispatch({
                                    type: 'FACET',
                                    value: (n: TaskNode) =>
                                        options.has(n.getTask().Title),
                                    column: 'Title',
                                }),
                            onFacetUnset: () =>
                                dispatch({
                                    type: 'FACET_UNSET',
                                    value: null,
                                    column: 'Title',
                                }),
                            column: col,
                        },
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
                isSorted: isSorted('Priority', filters.sorting),
                isSortedDescending: isSortedDescending('Priority', filters.sorting),
                onColumnClick: () => dispatch({ type: 'SORT', column: 'Priority' }),
                columnActionsMode: ColumnActionsMode.clickable,
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
                            onFacetSet: (options) =>
                                dispatch({
                                    type: 'FACET',
                                    value: (n: TaskNode) =>
                                        options.has(n.getTask().Priority),
                                    column: 'Priority',
                                }),
                            onFacetUnset: () =>
                                dispatch({
                                    type: 'FACET_UNSET',
                                    value: null,
                                    column: 'Priority',
                                }),
                            column: col,
                        },
                    });
                },
            },
            {
                key: 'Responsible',
                name: 'Responsible',
                fieldName: 'Responsible',
                minWidth: 150,
                isFiltered: Boolean(filters.facetFilters['Responsible']),
                isSorted: isSorted('Responsible', filters.sorting),
                isSortedDescending: isSortedDescending('Responsible', filters.sorting),
                onColumnClick: () => dispatch({ type: 'SORT', column: 'Responsible' }),
                columnActionsMode: ColumnActionsMode.clickable,
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
                            onFacetSet: (options) =>
                                dispatch({
                                    type: 'FACET',
                                    value: (n: TaskNode) =>
                                        options.has(
                                            n.getTask().Responsible.Title
                                        ),
                                    column: 'Responsible',
                                }),
                            onFacetUnset: () =>
                                dispatch({
                                    type: 'FACET_UNSET',
                                    value: null,
                                    column: 'Responsible',
                                }),
                            column: col,
                        },
                    });
                },
            },
            {
                key: 'Status',
                name: 'Status',
                fieldName: 'Status',
                isFiltered: Boolean(filters.facetFilters['Status']),
                isSorted: isSorted('Status', filters.sorting),
                isSortedDescending: isSortedDescending('Status', filters.sorting),
                onColumnClick: () => dispatch({ type: 'SORT', column: 'Status' }),
                columnActionsMode: ColumnActionsMode.clickable,
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
                            onFacetSet: (options) =>
                                dispatch({
                                    type: 'FACET',
                                    value: (n: TaskNode) =>
                                        options.has(n.getTask().Status),
                                    column: 'Status',
                                }),
                            onFacetUnset: () =>
                                dispatch({
                                    type: 'FACET_UNSET',
                                    value: null,
                                    column: 'Status',
                                }),
                            column: col,
                        },
                    });
                },
                minWidth: 100,
            },
            {
                key: 'Progress',
                name: 'Progress',
                fieldName: 'Progress',
                minWidth: 100,
                isSorted: isSorted('Progress', filters.sorting),
                isSortedDescending: isSortedDescending('Progress', filters.sorting),
                onColumnClick: () => dispatch({ type: 'SORT', column: 'Progress' }),
                onColumnContextMenu: () => null,
            },
            {
                key: 'DueDate',
                name: 'Due Date',
                fieldName: 'DueDate',
                minWidth: 100,
                isSorted: isSorted('DueDate', filters.sorting),
                isSortedDescending: isSortedDescending('DueDate', filters.sorting),
                onColumnClick: () => dispatch({ type: 'SORT', column: 'DueDate' }),
                onColumnContextMenu: () => null,
            },
            {
                key: 'Team',
                name: 'Team',
                fieldName: 'Team',
                isFiltered: Boolean(filters.facetFilters['Team']),
                isSorted: isSorted('Team', filters.sorting),
                isSortedDescending: isSortedDescending('Team', filters.sorting),
                onColumnClick: () => dispatch({ type: 'SORT', column: 'Team' }),
                columnActionsMode: ColumnActionsMode.clickable,
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
                            onFacetSet: (options) =>
                                dispatch({
                                    type: 'FACET',
                                    value: (n: TaskNode) =>
                                        options.has(n.getTask().Team),
                                    column: 'Team',
                                }),
                            onFacetUnset: () =>
                                dispatch({
                                    type: 'FACET_UNSET',
                                    value: null,
                                    column: 'Team',
                                }),
                            column: col,
                        },
                    });
                },
                minWidth: 100,
            },
            {
                key: 'Timing',
                name: 'Timing',
                fieldName: 'Timing',
                minWidth: 200,
                isSorted: isSorted('Timing', filters.sorting),
                isSortedDescending: isSortedDescending('Timing', filters.sorting),
                onColumnClick: () => dispatch({ type: 'SORT', column: 'Timing' }),
                onColumnContextMenu: () => null,
            },
        ],
        [tree, filters.sorting]
    );

    return { columns };
};
