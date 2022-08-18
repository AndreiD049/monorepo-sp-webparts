import { useContext } from 'react';
import CipWebPart from '../CipWebPart';
import { GlobalContext } from '../utils/GlobalContext';
import { ICreateTask } from './ICreateTask';
import { ITaskOverview, LIST_EXPAND, LIST_SELECT } from './ITaskOverview';
import { isFinished } from './task-utils';

/**
 * Tasks service
 */
export const useTasks = (tennantKey: string = 'Data') => {
    const ctx = useContext(GlobalContext);
    const sp = CipWebPart.SPBuilder.getSP(tennantKey);
    const list = sp.web.lists.getByTitle(ctx.properties.tasksListName);

    const getTaskListId = async () => {
        return (await list.select('Id')()).Id;
    }

    const getAllRequest = () => {
        return list.items.select(...LIST_SELECT).expand(...LIST_EXPAND);
    };

    const getAll = async (): Promise<ITaskOverview[]> => {
        return getAllRequest()();
    };

    const getUserTasks = async (userId: number, status: 'Open' | 'Finished' | 'All'): Promise<ITaskOverview[]> => {
        let filter = `ResponsibleId eq ${userId}`;
        // Handle status
        switch (status) {
            case 'Finished':
                filter += ` and FinishDate ne null`;
                break;
            case 'Open':
                filter += ` and FinishDate eq null`;
                break;
        };
        return list.items
            .filter(filter)
            .select(...LIST_SELECT)
            .expand(...LIST_EXPAND)();
    };

    const getTaskRequest = (id: number) => {
        return list.items
            .getById(id)
            .select(...LIST_SELECT)
            .expand(...LIST_EXPAND);
    };

    const getTask = async (id: number): Promise<ITaskOverview> => {
        return getTaskRequest(id)();
    };


    const getMainsRequest = (filter: string) => {
        return list.items
            .filter(filter)
            .select(...LIST_SELECT)
            .expand(...LIST_EXPAND);
    }

    const getNonFinishedMains = async (): Promise<ITaskOverview[]> => {
        return getMainsRequest(`FinishDate eq null and Parent eq null`)();
    };

    const getFinishedMains = async (): Promise<ITaskOverview[]> => {
        return getMainsRequest(`FinishDate ne null and Parent eq null`)();
    }

    const getAllMains = async (): Promise<ITaskOverview[]> => {
        return getMainsRequest(`Parent eq null`)();
    }

    const getSubtasksRequest = (id: number) => {
        return list.items
            .filter(`ParentId eq ${id}`)
            .select(...LIST_SELECT)
            .expand(...LIST_EXPAND);
    };

    const deleteTaskAndSubtasks = async (task: ITaskOverview) => {
        // All subtasks should be deleted because of list field setup (DeleteBehavior Cascade)
        await list.items.getById(task.Id).delete();
    }

    const getSubtasks = async (parent: ITaskOverview): Promise<ITaskOverview[]> => {
        let subtasks = await getSubtasksRequest(parent.Id)();
        // Guard if we have wrong number of subtasks
        if (subtasks.length !== parent.Subtasks) {
            await updateTask(parent.Id, {
                Subtasks: subtasks.length,
            });
        }
        return subtasks;
    };

    const createTask = async (details: ICreateTask) => {
        const payload: ICreateTask = {
            ...details,
            EffectiveTime: 0,
            Status: 'New',
            Progress: 0,
        };
        const created = await list.items.add(payload);
        await created.item.update({
            MainTaskId: created.data.Id,
        });
        return created.data.Id;
    };

    const createSubtask = async (
        details: ICreateTask,
        parent: ITaskOverview
    ) => {
        const payload: ICreateTask = {
            ...details,
            EffectiveTime: 0,
            Status: 'New',
            Progress: 0,
            ParentId: parent.Id,
            MainTaskId: parent.MainTaskId,
        };
        const added = await list.items.add(payload);
        const subtasks = await getSubtasks(parent);
        await updateTask(parent.Id, {
            Subtasks: subtasks.length,
        });
        return added.data.Id;
    };

    const updateTask = async (
        id: number,
        details: Partial<ITaskOverview & { ResponsibleId: number }>
    ) => {
        await list.items.getById(id).update(details);
    };

    /**
     * @param taskId id of the task where comment was added
     * @returns the latest version of the task
     */
    const commentAdded = async (taskId: number) => {
        const latest = await getTask(taskId);
        latest.CommentsCount += 1;
        await updateTask(taskId, {
            CommentsCount: latest.CommentsCount,
        });
        return latest;
    };

    /**
     * @param taskId task to be updated
     * @param attachments How many attachments were adde/removed (can be newgative)
     * @returns the latest attachment
     */
    const attachmentsUpdated = async (taskId: number, attachments: number) => {
        const latest = await getTask(taskId);
        latest.AttachmentsCount = Math.max(latest.AttachmentsCount + attachments, 0);
        await updateTask(taskId, {
            AttachmentsCount: latest.AttachmentsCount,
        });
        return latest;
    };

    const finishTask = async (id: number) => {
        const item = await getTask(id);
        // Already finished
        if (isFinished(item)) return;
        await updateTask(id, {
            FinishDate: new Date().toISOString(),
            Status: 'Finished',
            Progress: 1,
        });
        // Check if we need to remove subtask from parent
        if (item.ParentId) {
            const parent = await getTask(item.ParentId);
            const subtasks = await getSubtasks(parent);
            await updateTask(item.ParentId, {
                Subtasks: subtasks.length,
                FinishedSubtasks: subtasks.filter((s) => isFinished(s)).length,
            });
        }
    };

    const reopenTask = async (id: number) => {
        const item = await getTask(id);
        // Not finished
        if (!isFinished(item)) return;
        await updateTask(id, {
            FinishDate: null,
            Status: 'In-Progress',
        });
        if (item.ParentId) {
            const parent = await getTask(item.ParentId);
            const subtasks = await getSubtasks(parent);
            await updateTask(item.ParentId, {
                Subtasks: subtasks.length,
                FinishedSubtasks: subtasks.filter((s) => isFinished(s)).length,
            });
        }
    };

    return {
        getAll,
        getNonFinishedMains,
        getFinishedMains,
        getAllMains,
        getSubtasks,
        getTask,
        createTask,
        createSubtask,
        updateTask,
        commentAdded,
        attachmentsUpdated,
        finishTask,
        reopenTask,
        getTaskListId,
        deleteTaskAndSubtasks,
        getUserTasks,
    };
};
