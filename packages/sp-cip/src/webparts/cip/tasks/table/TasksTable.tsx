import {
    DetailsList,
    DetailsListLayoutMode,
    SelectionMode,
} from 'office-ui-fabric-react';
import * as React from 'react';
import CipCommandBar, { AssigneeSelected, StatusSelected } from '../../components/CipCommandBar';
import { useCallout } from '../../components/useCallout';
import { createTaskTree } from '../graph/factory';
import Task from '../Task';
import { useGroups } from './useGroups';
import { useColumns } from './useColumns';
import { TaskNode } from '../graph/TaskNode'
import { filtersReducer, SEARCH, STATUS } from './filters-reducer';
import { useTasksFetch } from './useTasksFetch';

const TasksTable = () => {
    const { CalloutComponent } = useCallout();
    const [filters, dispatch] = React.useReducer(filtersReducer, {
        search: '',
        assignedTo: AssigneeSelected.Single,
        status: StatusSelected.Open,
    });
    const { tasks } = useTasksFetch(filters);

    const tree = React.useMemo(() => {
        if (tasks !== null) {
            return createTaskTree(tasks);
        }
        return new TaskNode();
    }, [tasks]);

    const filteredTree = React.useMemo(() => {
        const lowerSearch = filters.search.toLowerCase();
        return tree
            .clone()
            .filter([
                (node) =>
                    node.getTask().Title.toLowerCase().indexOf(lowerSearch) !==
                        -1 ||
                    node
                        .getTask()
                        .Responsible.Title.toLowerCase()
                        .indexOf(lowerSearch) !== -1,
            ]);
    }, [tree, filters.search]);

    const rows = React.useMemo(() => {
        return filteredTree
            .getChildren()
            .filter((c) => c.Display !== 'hidden')
            .sort((a, b) => (a.Category < b.Category ? -1 : 1))
            .map((item) => ({
                key: item.Id,
                data: item,
            }));
    }, [filteredTree]);

    const { columns } = useColumns(filteredTree);

    const { groups, groupProps } = useGroups(rows);

    return (
        <>
            <CipCommandBar 
                onSearch={(val) => dispatch({type: SEARCH, value: val})} 
                onStatusSelectedChange={(val) => dispatch({ type: STATUS, value: val })}
            />
            <DetailsList
                groups={groups}
                groupProps={groupProps}
                layoutMode={DetailsListLayoutMode.fixedColumns}
                selectionMode={SelectionMode.none}
                columns={columns}
                items={rows}
                onRenderRow={(props) => (
                    <Task
                        isFiltered={filters.search !== ''}
                        rowProps={props}
                        node={props.item.data}
                    />
                )}
            />
            {CalloutComponent}
        </>
    );
};

export default TasksTable;
