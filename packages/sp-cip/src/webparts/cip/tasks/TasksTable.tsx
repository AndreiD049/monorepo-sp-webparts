import {
    DetailsList,
    DetailsListLayoutMode,
    IColumn,
    MessageBarType,
    SelectionMode,
} from 'office-ui-fabric-react';
import * as React from 'react';
import { SPnotify } from 'sp-react-notifications';
import { ITask } from './ITask';
import Task from './Task';
import { useTasks } from './useTasks';

const columns: IColumn[] = [
    {
        key: 'Title',
        name: 'Title',
        fieldName: 'Title',
        minWidth: 300,
        isResizable: true,
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
    }
];

const TasksTable = () => {
    const { getNonFinishedMains } = useTasks()
    const [items, setItems] = React.useState<ITask[]>([]);

    React.useEffect(() => {
        async function run() {
            try {
                const tasks = await getNonFinishedMains();
                setItems(tasks);
            } catch (err) {
                SPnotify({
                    message: err.message,
                    messageType: MessageBarType.error,
                });
            }
        }
        run();
    }, []);

    return (
        <>
            <DetailsList
                layoutMode={DetailsListLayoutMode.fixedColumns}
                selectionMode={SelectionMode.none}
                columns={columns}
                items={items}
                onRenderRow={(props) => <Task rowProps={props} nestLevel={0} />}
            />
        </>
    );
};

export default TasksTable;
