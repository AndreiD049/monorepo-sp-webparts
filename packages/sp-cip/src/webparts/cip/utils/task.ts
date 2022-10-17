import { ITaskOverview } from '@service/sp-cip/dist/models/ITaskOverview';
import MainService from '../services/main-service';
import { SPnotify } from 'sp-react-notifications';
import { MessageBarType } from "office-ui-fabric-react";

export async function finishTask(task: ITaskOverview, currentUserId: number, status: string = 'Finished'): Promise<ITaskOverview> {
    /* user should first register some time */
    if (task.EffectiveTime === 0 && task.Subtasks === 0 && status === 'Finished') {
        SPnotify({
            message: 'Effective time = 0. Some time should be registered first.',
            messageType: MessageBarType.error,
        });
        return null;
    }
    if (task.Subtasks !== task.FinishedSubtasks) {
        SPnotify({
            message: 'Error - There are unfinished subtasks.\nPlease finish/cancel all subtasks first.',
            messageType: MessageBarType.error,
        });
        return null;
    }
    const taskService = MainService.getTaskService();
    const actionService = MainService.getActionService();
    await taskService.finishTask(task.Id, status);
    const newItem = await taskService.getTask(task.Id);
    await actionService.addAction(
        task.Id,
        'Finished',
        null,
        currentUserId,
        new Date().toISOString(),
    );
    return newItem;
}
