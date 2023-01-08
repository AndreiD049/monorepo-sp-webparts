import {
    IPersonaProps,
} from 'office-ui-fabric-react';
import * as React from 'react';
import { actionUpdated } from '../../actionlog/ActionLog';
import { taskUpdated } from '../../utils/dom-events';
import MainService from '../../services/main-service';
import { ITaskOverview } from '@service/sp-cip/dist/models/ITaskOverview';
import { IAction } from '@service/sp-cip/dist/services/action-service';
import { GlobalContext } from '../../utils/GlobalContext';
import {
    hideDialog,
    TimeLogGeneral,
} from 'sp-components';
import { loadingStart, loadingStop } from '../utils/LoadingAnimation';

export interface ITimeLogGeneralProps {
    dialogId: string;
    task?: ITaskOverview;
    action?: IAction;
    /* initial hours value */
    time?: number;
    /* initial comment value */
    description?: string;
    afterLog?: () => void;
}

export const TimeLog: React.FC<ITimeLogGeneralProps> = (props) => {
    const { currentUser } = React.useContext(GlobalContext);
    const [tasks, setTasks] = React.useState<ITaskOverview[]>([]);
    const taskService = MainService.getTaskService();
    const actionService = MainService.getActionService();
    const userService = MainService.getUserService();
    const [users, setUsers] = React.useState<IPersonaProps[]>([]);

    /** Fetch tasks */
    React.useEffect(() => {
        async function getTasks(): Promise<void> {
            const result = await taskService.getAll();
            setTasks(result);
        }
        getTasks().catch((err) => console.error(err));
    }, []);

    React.useEffect(() => {
        async function run(): Promise<void> {
            setUsers(await userService.getPersonaProps());
        }
        run().catch((err) => console.error(err));
    }, []);

    // New action - has selected task
    const handleLogNew = async (
        action: Partial<IAction>,
        taskId?: number
    ): Promise<void> => {
        await actionService.addAction(
            taskId,
            action.ActivityType,
            action.Comment,
            action.UserId,
            action.Date
        );
    };

    const handleTaskEffectiveTimeChange = async (
        taskId: number,
        time: number
    ): Promise<void> => {
        const task = await taskService.getTask(taskId);
        await taskService.updateTask(taskId, {
            EffectiveTime: task.EffectiveTime + time,
        });
        taskUpdated(await taskService.getTask(taskId));
    };

    // Already existing action log, update it
    // And also update the task with the delta
    const handleLogUpdate = async (actionId: number, update: Partial<IAction>): Promise<void> => {
        await actionService.updateAction(actionId, update);
        actionUpdated(await actionService.getAction(actionId));
    };

    return (
        <TimeLogGeneral
            task={props.task}
            action={props.action}
            users={users}
            tasks={tasks}
            currentUserId={currentUser.Id}
            time={props.time}
            description={props.description}
            onActionAdd={handleLogNew}
            onActionEdit={handleLogUpdate}
            onTaskEffectiveTimeChange={handleTaskEffectiveTimeChange}
            beforeActions={() => {
                loadingStart();
                hideDialog(props.dialogId);
            }}
            afterActions={() => {
                loadingStop();
                if (props.afterLog) {
                    props.afterLog();
                }
            }}
        />
    );
};
