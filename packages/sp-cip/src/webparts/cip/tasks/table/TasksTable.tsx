import {
    DetailsList,
    DetailsListLayoutMode,
    IDetailsList,
    SelectionMode,
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

const TasksTable = () => {
    const tableRef = React.useRef(null);
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

    /** Resize table to fit to current screen. Avoid showing vertical scrollbar */
    React.useEffect(() => {
        const el: HTMLDivElement = tableRef.current.querySelector('.ms-DetailsList');
        const rect = el.getBoundingClientRect();
        el.style.maxHeight = `${window.innerHeight - rect.top - 14}px`;
    }, [tableRef.current, items]);

    return (
        <>
            <CipCommandBar
                onSearch={(val) => dispatch({ type: 'SEARCH', value: val })}
                onStatusSelectedChange={(val) =>
                    dispatch({ type: 'STATUS', value: val })
                }
                onAssignedToChange={(val) =>
                    dispatch({ type: 'ASSIGNED', value: val })
                }
                onShowCategoriesToggle={handleToggleShowCategories}
            />
            <div ref={tableRef}>
                <DetailsList
                    styles={{
                        root: {
                            overflow: 'unset',
                        },
                    }}
                    className={styles.table}
                    groups={groups}
                    groupProps={groupProps}
                    layoutMode={DetailsListLayoutMode.fixedColumns}
                    selectionMode={SelectionMode.none}
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
            </div>
            {CalloutComponent}
        </>
    );
};

export default TasksTable;
