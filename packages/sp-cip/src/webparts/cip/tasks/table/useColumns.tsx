import { ITaskOverview } from '@service/sp-cip/dist/models/ITaskOverview';
import { ColumnActionsMode, IColumn } from '@fluentui/react';
import * as React from 'react';
import { calloutVisibility } from '../../utils/dom-events';
import { ChoiceFacet, IChoiceFacetProps } from './facet/ChoiceFacet';
import { ICipFilters, IFilterAction } from './sort-filter/filters-reducer';
import { ISortedColumn, SortDirection } from './sort-filter/sorting';

const isSorted = (column: string, sorting: ISortedColumn): boolean =>
    sorting?.column === column;
const isSortedDescending = (column: string, sorting: ISortedColumn): boolean =>
    isSorted(column, sorting) && sorting?.direction === SortDirection.Descending;

export const useColumns = (
	tasks: ITaskOverview[],
    filters: ICipFilters,
    dispatch: React.Dispatch<IFilterAction>
): { columns: IColumn[] } => {
    const columns: IColumn[] = React.useMemo(
        () => [
            {
                key: 'Title',
                name: 'Title',
                fieldName: 'Title',
                minWidth: 500,
                isResizable: true,
                isFiltered: Boolean(filters.facetFilters.Title),
                isSorted: isSorted('Title', filters.sorting),
                isSortedDescending: isSortedDescending('Title', filters.sorting),
                onColumnClick: () => dispatch({ type: 'SORT', column: 'Title' }),
                columnActionsMode: ColumnActionsMode.clickable,
                onColumnContextMenu: (col, ev) => {
                    calloutVisibility<IChoiceFacetProps>({
                        visible: true,
                        isBeakVisible: false,
                        target: ev.currentTarget as HTMLDivElement,
                        gapSpace: 3,
                        RenderComponent: ChoiceFacet,
                        componentProps: {
                            options: tasks,
                            getValue: (n) => n.Title,
                            onFacetSet: (options) =>
                                dispatch({
                                    type: 'FACET',
                                    value: (t: ITaskOverview) =>
                                        options.has(t.Title),
                                    column: 'Title',
                                }),
                            onFacetUnset: () =>
                                dispatch({
                                    type: 'FACET_UNSET',
                                    value: null,
                                    column: 'Title',
                                }),
                            column: col,
							filters,
                        },
                    });
                },
            },
            {
                key: 'Actions',
                name: 'Actions',
                fieldName: 'Actions',
                minWidth: 180,
                onColumnContextMenu: (): void => null,
            },
            {
                key: 'Priority',
                name: 'Priority',
                fieldName: 'Priority',
                minWidth: 100,
                isFiltered: Boolean(filters.facetFilters.Priority),
                isSorted: isSorted('Priority', filters.sorting),
                isSortedDescending: isSortedDescending('Priority', filters.sorting),
                onColumnClick: () => dispatch({ type: 'SORT', column: 'Priority' }),
                columnActionsMode: ColumnActionsMode.clickable,
                onColumnContextMenu: (col, ev) => {
                    calloutVisibility<IChoiceFacetProps>({
                        visible: true,
                        isBeakVisible: false,
                        target: ev.currentTarget as HTMLDivElement,
                        gapSpace: 3,
                        RenderComponent: ChoiceFacet,
                        componentProps: {
                            options: tasks,
                            getValue: (n) => n.Priority,
                            onFacetSet: (options) =>
                                dispatch({
                                    type: 'FACET',
                                    value: (n: ITaskOverview) =>
                                        options.has(n.Priority),
                                    column: 'Priority',
                                }),
                            onFacetUnset: () =>
                                dispatch({
                                    type: 'FACET_UNSET',
                                    value: null,
                                    column: 'Priority',
                                }),
                            column: col,
							filters,
                        },
                    });
                },
            },
            {
                key: 'Responsible',
                name: 'Responsible',
                fieldName: 'Responsible',
                minWidth: 150,
                isFiltered: Boolean(filters.facetFilters.Responsible),
                isSorted: isSorted('Responsible', filters.sorting),
                isSortedDescending: isSortedDescending('Responsible', filters.sorting),
                onColumnClick: () => dispatch({ type: 'SORT', column: 'Responsible' }),
                columnActionsMode: ColumnActionsMode.clickable,
                onColumnContextMenu: (col, ev) => {
                    calloutVisibility<IChoiceFacetProps>({
                        visible: true,
                        isBeakVisible: false,
                        target: ev.currentTarget as HTMLDivElement,
                        gapSpace: 3,
                        RenderComponent: ChoiceFacet,
                        componentProps: {
                            options: tasks,
                            getValue: (t) => t.Responsible.Title,
                            onFacetSet: (options) =>
                                dispatch({
                                    type: 'FACET',
                                    value: (n: ITaskOverview) =>
                                        options.has(
                                            n.Responsible.Title
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
							filters,
                        },
                    });
                },
            },
            {
                key: 'Status',
                name: 'Status',
                fieldName: 'Status',
                isFiltered: Boolean(filters.facetFilters.Status),
                isSorted: isSorted('Status', filters.sorting),
                isSortedDescending: isSortedDescending('Status', filters.sorting),
                onColumnClick: () => dispatch({ type: 'SORT', column: 'Status' }),
                columnActionsMode: ColumnActionsMode.clickable,
                onColumnContextMenu: (col, ev) => {
                    calloutVisibility<IChoiceFacetProps>({
                        visible: true,
                        isBeakVisible: false,
                        target: ev.currentTarget as HTMLDivElement,
                        gapSpace: 3,
                        RenderComponent: ChoiceFacet,
                        componentProps: {
                            options: tasks,
                            getValue: (n) => n.Status,
                            onFacetSet: (options) =>
                                dispatch({
                                    type: 'FACET',
                                    value: (n: ITaskOverview) =>
                                        options.has(n.Status),
                                    column: 'Status',
                                }),
                            onFacetUnset: () =>
                                dispatch({
                                    type: 'FACET_UNSET',
                                    value: null,
                                    column: 'Status',
                                }),
                            column: col,
							filters,
                        },
                    });
                },
                minWidth: 100,
                isResizable: true,
            },
            {
                key: 'Progress',
                name: 'Progress',
                fieldName: 'Progress',
                minWidth: 100,
                isSorted: isSorted('Progress', filters.sorting),
                isSortedDescending: isSortedDescending('Progress', filters.sorting),
                onColumnClick: () => dispatch({ type: 'SORT', column: 'Progress' }),
                onColumnContextMenu: (): void => null,
            },
            {
                key: 'DueDate',
                name: 'Due Date',
                fieldName: 'DueDate',
                minWidth: 110,
                isSorted: isSorted('DueDate', filters.sorting),
                isSortedDescending: isSortedDescending('DueDate', filters.sorting),
                onColumnClick: () => dispatch({ type: 'SORT', column: 'DueDate' }),
                onColumnContextMenu: (): void => null,
            },
            {
                key: 'Team',
                name: 'Team',
                fieldName: 'Team',
                isFiltered: Boolean(filters.facetFilters.Team),
                isSorted: isSorted('Team', filters.sorting),
                isSortedDescending: isSortedDescending('Team', filters.sorting),
                onColumnClick: () => dispatch({ type: 'SORT', column: 'Team' }),
                columnActionsMode: ColumnActionsMode.clickable,
                onColumnContextMenu: (col, ev) => {
                    calloutVisibility<IChoiceFacetProps>({
                        visible: true,
                        isBeakVisible: false,
                        target: ev.currentTarget as HTMLDivElement,
                        gapSpace: 3,
                        RenderComponent: ChoiceFacet,
                        componentProps: {
                            options: tasks,
                            getValue: (n) => n.Team,
                            onFacetSet: (options) =>
                                dispatch({
                                    type: 'FACET',
                                    value: (n: ITaskOverview) =>
                                        options.has(n.Team),
                                    column: 'Team',
                                }),
                            onFacetUnset: () =>
                                dispatch({
                                    type: 'FACET_UNSET',
                                    value: null,
                                    column: 'Team',
                                }),
                            column: col,
							filters,
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
                onColumnContextMenu: (): void => null,
            },
        ],
        [tasks, filters]
    );

    return { columns };
};
