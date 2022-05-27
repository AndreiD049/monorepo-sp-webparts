import {
    DetailsList,
    DetailsListLayoutMode,
    SelectionMode,
} from 'office-ui-fabric-react';
import * as React from 'react';
import CipCommandBar from '../../components/CipCommandBar';
import { useCallout } from '../../components/useCallout';
import { relinkParent, taskAddedHandler, taskUpdatedHandler } from '../../utils/dom-events';
import { createTaskTree } from '../graph/factory';
import { ITaskOverview } from '../ITaskOverview';
import Task from '../Task';
import { useGroups } from './useGroups';
import { useTasks } from '../useTasks';
import { useColumns } from './useColumns';


const TasksTable = () => {
    const { getNonFinishedMains, getAll } = useTasks();
    const [tasks, setTasks] = React.useState<ITaskOverview[]>([]);
    const [allTasks, setAllTasks] = React.useState<ITaskOverview[]>([]);
    const { CalloutComponent } = useCallout();
    const [search, setSearch] = React.useState('');

    React.useEffect(() => {
        if (tasks.length === 0) getNonFinishedMains().then((t) => setTasks(t));
        if (allTasks.length === 0 && search !== '') getAll().then((t) => {
            setAllTasks(t);
            setTasks(t);
        });
    }, [tasks, setAllTasks, search]);

    // Dom events
    React.useEffect(() => {
        const removeTasksAdded = taskAddedHandler((tasks) => {
            const set = new Set(tasks.map((t) => t.Id));
            setTasks((prev) => [
                ...prev.filter((x) => !set.has(x.Id)),
                ...tasks,
            ]);
            // relink all tasks
            relinkParent('all')
        });
        const removeTaskUpdated = taskUpdatedHandler((task) => {
            setTasks((prev) => prev.map((t) => (t.Id === task.Id ? task : t)));
        });

        return () => {
            removeTasksAdded();
            removeTaskUpdated();
        };
    }, []);

    const tree = React.useMemo(() => {
        return createTaskTree(tasks);
    }, [tasks]);

    const filteredTree = React.useMemo(() => {
        const lowerSearch = search.toLowerCase();
        return tree.clone().filter([
            (node) => node.getTask().Title.toLowerCase().indexOf(lowerSearch) !== -1,
            (node) => node.getTask().Responsible.Title.toLowerCase().indexOf(lowerSearch) !== -1,
        ]);
    }, [tree, search]);

    const rows = React.useMemo(() => {
        return filteredTree
            .getChildren()
            .filter((c) => c.Display !== 'hidden')
            .sort((a, b) => a.Category < b.Category ? -1 : 1)
            .map((item) => ({
                key: item.Id,
                data: item,
            }));
    }, [filteredTree]);
    
    const { columns } = useColumns(filteredTree);

    const { groups, groupProps } = useGroups(rows);

    return (
        <>
            <CipCommandBar onSearch={(val) => setSearch(val)} />
            <DetailsList
                groups={groups}
                groupProps={groupProps}
                layoutMode={DetailsListLayoutMode.fixedColumns}
                selectionMode={SelectionMode.none}
                columns={columns}
                items={rows}
                onRenderRow={(props) => (
                    <Task
                        isFiltered={search !== ''}
                        rowProps={props}
                        node={props.item.data}
                        setTasks={setTasks}
                    />
                )}
            />
            {CalloutComponent}
        </>
    );
};

export default TasksTable;
