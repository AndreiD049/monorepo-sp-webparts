import {
    CollapseAllVisibility,
    DetailsList,
    DetailsListLayoutMode,
    IColumn,
    IGroup,
    MessageBarType,
    SelectionMode,
} from 'office-ui-fabric-react';
import * as React from 'react';
import { SPnotify } from 'sp-react-notifications';
import { taskAddedHandler, taskUpdatedHandler } from '../utils/dom-events';
import { createTaskTree } from './graph/factory';
import { ITaskOverview } from './ITaskOverview';
import Task from './Task';
import { useTasks } from './useTasks';

const columns: IColumn[] = [
    {
        key: 'Title',
        name: 'Title',
        fieldName: 'Title',
        minWidth: 500,
        isResizable: true,
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
        minWidth: 150,
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

    const sortedTasks = React.useMemo(() => {
        return tree
            .getChildren()
            .sort((a, b) =>
                a.getTask().Category < b.getTask().Category ? -1 : 1
            ).map((item) => ({
                key: item.Id,
                data: item,
            }));
    }, [tree]);

    const groups: IGroup[] = React.useMemo(() => {
        const groups = {};
        sortedTasks.forEach((node, idx) => {
            const category = node.data.getTask().Category || 'Other';
            if (category in groups) {
                groups[category].count += 1;
            } else {
                groups[category] = {
                    key: category,
                    name: category,
                    count: 1,
                    startIndex: idx,
                };
            }
        });
        return Object.values(groups);
    }, [sortedTasks]);

    return (
        <>
            <DetailsList
                groups={groups}
                groupProps={{
                    collapseAllVisibility: CollapseAllVisibility.hidden,
                }}
                layoutMode={DetailsListLayoutMode.fixedColumns}
                selectionMode={SelectionMode.none}
                columns={columns}
                items={sortedTasks}
                onRenderRow={(props) => (
                    <Task
                        rowProps={props}
                        node={props.item.data}
                        setTasks={setTasks}
                    />
                )}
            />
        </>
    );
};

export default TasksTable;
