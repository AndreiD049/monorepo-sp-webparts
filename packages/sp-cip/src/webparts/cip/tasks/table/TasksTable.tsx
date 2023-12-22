import {
    DetailsList,
    DetailsListLayoutMode,
    ScrollablePane,
    SelectionMode,
    Sticky,
    StickyPositionType,
} from 'office-ui-fabric-react';
import * as React from 'react';
import CipCommandBar from '../../components/command-bar/CipCommandBar';
import { useCallout } from '../../components/useCallout';
import Task from '../Task';
import { useGroups } from './useGroups';
import { useColumns } from './useColumns';
import { filtersReducer } from './sort-filter/filters-reducer';
import { useTasksFetch } from './useTasksFetch';
import { useShowCategories } from './useShowCategories';
import styles from './TasksTable.module.scss';
import { createTaskTree } from '../graph/factory';
import { TaskNode } from '../graph/TaskNode';
import { applyFilters, applySearch } from './sort-filter/filtering';
import { getColumnSortingFunc } from './sort-filter/sorting';

export interface ITasksTableProps {
    onTeamSelect: (team: string) => void;
}

const TasksTable: React.FC<ITasksTableProps> = (props) => {
    const { CalloutComponent } = useCallout();
    const [filters, dispatch] = React.useReducer(filtersReducer, {
        search: '',
        assignedTo: null,
        status: null,
        facetFilters: {},
    });
    const { showCategories, handleToggleShowCategories } = useShowCategories();

    const { tasks } = useTasksFetch(filters.status, filters.assignedTo);

	const tree: TaskNode = React.useMemo(() => {
		let result = applySearch(tasks, filters.search);
		result = applyFilters(result, Object.values(filters.facetFilters));
		return createTaskTree(result);
	}, [tasks, filters])

    const items = React.useMemo(() => {
		const children = tree.getChildren();
		// Don't remove sorting, it's important for grouping
		children.sort(getColumnSortingFunc(filters.sorting, showCategories));
        return children
            .map((n) => ({
                key: n.Id,
                data: n,
            }));
    }, [tree, filters, showCategories]);

    const { columns } = useColumns(tasks, filters, dispatch);

    const { groups, groupProps } = useGroups(items, showCategories);

    return (
        <>
            <CipCommandBar
                onSearch={(val) => dispatch({ type: 'SEARCH', value: val })}
                onTeamSelect={props.onTeamSelect}
                onStatusSelectedChange={(val) =>
                    dispatch({ type: 'STATUS', value: val })
                }
                onAssignedToChange={(val) =>
                    dispatch({ type: 'ASSIGNED', value: val })
                }
                onShowCategoriesToggle={handleToggleShowCategories}
            />
            <div className={styles.tableWrapper}>
                <ScrollablePane
                    className={styles.scrollbar}
                    styles={{
                        stickyAbove: { zIndex: 999 },
                        contentContainer: { className: 'test' },
                    }}
                >
                    <DetailsList
                        styles={{
                            root: {
                                display: 'initial',
                                '& div[role="grid"]': {
                                    paddingBottom: '40px',
                                },
                            },
                        }}
                        className={styles.table}
                        groups={groups}
                        groupProps={groupProps}
                        layoutMode={DetailsListLayoutMode.fixedColumns}
                        selectionMode={SelectionMode.none}
                        onRenderDetailsHeader={(props, defaultRender) => {
                            return (
                                <Sticky
                                    stickyPosition={StickyPositionType.Header}
                                >
                                    {defaultRender(props)}
                                </Sticky>
                            );
                        }}
                        columns={columns}
                        items={items}
                        onRenderRow={(props) => (
                            <Task
                                isFiltered={filters.search !== ''}
                                rowProps={props}
                                node={props.item.data}
                                style={{
                                    marginLeft: showCategories ? '36px' : '0px',
                                }}
                            />
                        )}
                    />
                </ScrollablePane>
            </div>
            {CalloutComponent}
        </>
    );
};

export default TasksTable;
