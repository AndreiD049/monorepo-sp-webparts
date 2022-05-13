import { getAllByAltText } from '@testing-library/react';
import {
    DetailsList,
    DetailsListLayoutMode,
    IColumn,
    MessageBarType,
    SelectionMode,
} from 'office-ui-fabric-react';
import * as React from 'react';
import { SPnotify } from 'sp-react-notifications';
import usePanel from '../components/usePanel';
import { REFRESH_PARENT_EVT } from '../utils/constants';
import { createTaskTree } from './graph/factory';
import { TaskNode } from './graph/TaskNode';
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
        // Register an event to refresh the list when needed
        document.addEventListener(REFRESH_PARENT_EVT, run);
        return () => document.removeEventListener(REFRESH_PARENT_EVT, run);
    }, []);

    const tree = React.useMemo(() => {
        return createTaskTree(tasks);
    }, [tasks]);

    return (
        <>
            <DetailsList
                layoutMode={DetailsListLayoutMode.fixedColumns}
                selectionMode={SelectionMode.none}
                columns={columns}
                items={tree.getChildren()}
                onRenderRow={(props) => <Task rowProps={props} node={props.item} setTasks={setTasks} />}
            />
        </>
    );
};

export default TasksTable;
