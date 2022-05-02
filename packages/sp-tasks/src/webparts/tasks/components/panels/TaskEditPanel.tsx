import { Panel, PrimaryButton, Text } from 'office-ui-fabric-react';
import * as React from 'react';
import ITask from '../../models/ITask';
import ITaskLog from '../../models/ITaskLog';
import GlobalContext from '../../utils/GlobalContext';
import { isTask } from '../../utils/utils';

type TaskType = 'task' | 'tasklog';

export interface ITaskEditPanel {
    open: boolean;
    onSave: () => void;
    type: TaskType;
}

const TaskEditPanel: React.FC<ITaskEditPanel> = (props) => {
    return (
        <Panel
            isOpen={props.open}
            headerText="Edit task"
            onRenderFooterContent={() => {
                return <PrimaryButton text="Save" onClick={props.onSave} />;
            }}
        >test</Panel>
    );
};

interface ITaskEditPanelWrapperProps {
    open: boolean;
    type: TaskType;
    task: ITask | ITaskLog;
}

export const TaskEditPanelWrapper: React.FC<ITaskEditPanelWrapperProps> = (props) => {
    const { TaskService, TaskLogsService } = React.useContext(GlobalContext);
    const [data, setData] = React.useState({
        Title: props.task?.Title,
        Description: isTask(props.task) ? props.task.Description : null,
        Time: props.task.Time,
    });

    const handleUpdate = React.useCallback(() => {
        if (open) {
            if (props.type === 'task') {
                console.log('update task');
            } else {
                console.log('update task log');
            }
        }
    }, [props]);

    return <TaskEditPanel open={props.open} type={props.type} onSave={handleUpdate} />;
};
