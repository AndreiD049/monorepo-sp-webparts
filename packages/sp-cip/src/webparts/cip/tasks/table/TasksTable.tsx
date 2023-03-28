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
import { useFilteredTree } from './sort-filter/useFilteredTree';
import { useShowCategories } from './useShowCategories';
import styles from './TasksTable.module.scss';

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

    const { tasks } = useTasksFetch(filters);

    const { tree } = useFilteredTree(tasks, filters, showCategories);

    const items = React.useMemo(() => {
        return tree
            .getChildren()
            .filter((n) => n.Display !== 'hidden')
            .map((n) => ({
                key: n.Id,
                data: n,
            }));
    }, [tree]);

    const { columns } = useColumns(tree, filters, dispatch);

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
