import {
    ColumnActionsMode,
    DetailsList,
    DetailsListLayoutMode,
    IColumn,
    MessageBarType,
    SelectionMode,
} from 'office-ui-fabric-react';
import * as React from 'react';
import { SPnotify } from 'sp-react-notifications';
import { useCallout } from '../components/useCallout';
import { relinkParent, taskAddedHandler, taskUpdatedHandler } from '../utils/dom-events';
import { createTaskTree } from './graph/factory';
import { ITaskOverview } from './ITaskOverview';
import Task from './Task';
import { useGroups } from './useGroups';
import { useTasks } from './useTasks';

const columns: IColumn[] = [
    {
        key: 'Title',
        name: 'Title',
        fieldName: 'Title',
        minWidth: 500,
        isResizable: true,
        columnActionsMode: ColumnActionsMode.hasDropdown,
        onColumnContextMenu: (col, ev) => {
            console.log(col, ev);
        }
    },
    {
        key: 'Actions',
        name: 'Actions',
        fieldName: 'Actions',
        minWidth: 100,
    },
    {
        key: 'Priority',
        name: 'Priority',
        fieldName: 'Priority',
        minWidth: 100,
    },
    {
        key: 'Responsible',
        name: 'Responsible',
        fieldName: 'Responsible',
        minWidth: 150,
    },
    {
        key: 'Status',
        name: 'Status',
        fieldName: 'Status',
        minWidth: 100,
    },
    {
        key: 'Progress',
        name: 'Progress',
        fieldName: 'Progress',
        minWidth: 100,
    },
    {
        key: 'DueDate',
        name: 'Due Date',
        fieldName: 'DueDate',
        minWidth: 100,
    },
    {
        key: 'Timing',
        name: 'Timing',
        fieldName: 'Timing',
        minWidth: 200,
    },
];

const TasksTable = () => {
    const { getNonFinishedMains, getAll } = useTasks();
    const [tasks, setTasks] = React.useState<ITaskOverview[]>([]);
    const { CalloutComponent } = useCallout();

    React.useEffect(() => {
        async function run() {
            try {
                // if no filters are applied
                const tasks = await getNonFinishedMains();
                setTasks(tasks);
            } catch (err) {
                SPnotify({
                    message: err.message,
                    messageType: MessageBarType.error,
                });
            }
        }
        run();
    }, []);

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
        return createTaskTree(tasks.sort((a, b) => a.Category < b.Category ? -1 : 1));
    }, [tasks]);

    const rows = React.useMemo(() => {
        return tree
            .getChildren()
            .map((item) => ({
                key: item.Id,
                data: item,
            }));
    }, [tree]);

    const { groups, groupProps } = useGroups(rows);

    return (
        <>
            <DetailsList
                groups={groups}
                groupProps={groupProps}
                layoutMode={DetailsListLayoutMode.fixedColumns}
                selectionMode={SelectionMode.none}
                columns={columns}
                items={rows}
                onRenderRow={(props) => (
                    <Task
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
