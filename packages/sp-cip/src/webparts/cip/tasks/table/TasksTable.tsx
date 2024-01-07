import {
    DetailsList,
    DetailsListLayoutMode,
    Icon,
    ScrollablePane,
    SelectionMode,
    Sticky,
    StickyPositionType,
    Text,
} from '@fluentui/react';
import * as React from 'react';
import CipCommandBar from '../../components/command-bar/CipCommandBar';
import { useCallout } from '../../components/useCallout';
import Task from '../Task';
import { useGroups } from './useGroups';
import { useColumns } from './useColumns';
import { filtersReducer, IFilterAction } from './sort-filter/filters-reducer';
import { useTasksFetch } from './useTasksFetch';
import { useShowCategories } from './useShowCategories';
import { createTaskTree } from '../graph/factory';
import { applyFilters, applySearch } from './sort-filter/filtering';
import { getColumnSortingFunc } from './sort-filter/sorting';
import styles from './TasksTable.module.scss';
import { AssigneeSelected } from '../../components/command-bar/CipAssigneeSelector';
import { assignedChange } from '../../utils/dom-events';

export interface ITasksTableProps {
    onTeamSelect: (team: string) => void;
}

const NoFilteredItems: React.FC = () => {
    return (
        <Text
            variant="mediumPlus"
            block
            style={{ textAlign: 'center', fontWeight: 'bold' }}
        >
			<Icon iconName='SearchData' style={{ fontSize: '2.5em' }} />
			{' '}
            No items found
        </Text>
    );
};

const NoTasksAssigned: React.FC<{
	assignedTo: AssigneeSelected;
	dispatch: React.Dispatch<IFilterAction>;
}> = (props) => {
	const handleChangeView = (ev: React.MouseEvent): void => {
		ev.preventDefault();
		props.dispatch({ type: 'ASSIGNED', value: AssigneeSelected.All });
		assignedChange(AssigneeSelected.All);
	}
    return (
        <Text
            variant="mediumPlus"
            block
            style={{ textAlign: 'center', fontWeight: 'bold' }}
        >
			<div>
			<Icon iconName='IconSetsFlag' style={{ fontSize: '2.5em' }} />
			{' '}
            There are no tasks in this view
			</div>
			<div>
				<a href="#" onClick={handleChangeView}>See team tasks view</a>
			</div>
        </Text>
    );
};

const TasksTable: React.FC<ITasksTableProps> = (props) => {
    const { CalloutComponent } = useCallout();
    const [filters, dispatch] = React.useReducer(filtersReducer, {
        search: '',
        assignedTo: null,
        status: null,
        facetFilters: {},
    });
    const { showCategories, handleToggleShowCategories } = useShowCategories();

    const { tasks, finished } = useTasksFetch(filters.status, filters.assignedTo);

    const tree = React.useMemo(() => {
        let result = applySearch(tasks, filters.search);
        result = applyFilters(result, Object.values(filters.facetFilters));
        return createTaskTree(result);
    }, [tasks, filters]);

    const items = React.useMemo(() => {
        const children = tree.getChildren();
        // Don't remove sorting, it's important for grouping
        children.sort(getColumnSortingFunc(filters.sorting, showCategories));
        return children.map((n) => ({
            key: n.Id,
            data: n,
        }));
    }, [tree, filters, showCategories]);

    const { columns } = useColumns(tasks, filters, dispatch);

    const { groups, groupProps } = useGroups(items, showCategories);

    let exceptionMessage = null;
    if (filters.search && items.length === 0) {
        exceptionMessage = <NoFilteredItems />;
    } else if (Object.keys(filters.facetFilters).length && items.length === 0) {
        exceptionMessage = <NoFilteredItems />;
    } else if (items.length	=== 0 && finished) {
		exceptionMessage = <NoTasksAssigned assignedTo={filters.assignedTo} dispatch={dispatch} />;
	}

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
                                key={props.item.data.Id}
                                rowProps={props}
                                node={props.item.data}
                                style={{
                                    marginLeft: showCategories ? '36px' : '0px',
                                }}
                            />
                        )}
                    />
                    {exceptionMessage}
                </ScrollablePane>
            </div>
            {CalloutComponent}
        </>
    );
};

export default TasksTable;
