import { useContext } from 'react';
import { IndexedDBCacher } from 'sp-indexeddb-caching';
import CipWebPart from '../CipWebPart';
import { GlobalContext } from '../utils/GlobalContext';
import { ICreateTask } from './ICreateTask';
import { ITaskOverview, LIST_EXPAND, LIST_SELECT } from './ITaskOverview';
import { isFinished } from './task-utils';

/**
 * Tasks service
 */
export const useTasks = () => {
    const ctx = useContext(GlobalContext);
    // const caching = IndexedDBCacher();
    // const sp = CipWebPart.SPBuilder.getSP('Data').using(
    //     caching.CachingTimeline
    // );
    const sp = CipWebPart.SPBuilder.getSP('Data');
    const list = sp.web.lists.getByTitle(ctx.properties.tasksListName);

    const getTaskListId = async () => {
        return (await list.select('Id')()).Id;
    }

    const getAllRequest = () => {
        return list.items.select(...LIST_SELECT).expand(...LIST_EXPAND);
    };

    // const getAllCache = () => caching.Cache.get(getAllRequest().toRequestUrl());

    const getAll = async (): Promise<ITaskOverview[]> => {
        return getAllRequest()();
    };

    const getTaskRequest = (id: number) => {
        return list.items
            .getById(id)
            .select(...LIST_SELECT)
            .expand(...LIST_EXPAND);
    };

    // const getTaskCache = (id: number) => caching.Cache.get(getTaskRequest(id).toRequestUrl());

    const getTask = async (id: number): Promise<ITaskOverview> => {
        return getTaskRequest(id)();
    };

    const getNonFinishedMainsRequest = () => {
        const filter = `FinishDate eq null and Parent eq null`;
        return list.items
            .filter(filter)
            .select(...LIST_SELECT)
            .expand(...LIST_EXPAND);
    };

    // const getNonFinishedMainsCache = () => {
    //     return caching.Cache.get(getNonFinishedMainsRequest().toRequestUrl());
    // }

    const getNonFinishedMains = async (): Promise<ITaskOverview[]> => {
        return getNonFinishedMainsRequest()();
    };

    const getSubtasksRequest = (id: number) => {
        return list.items
            .filter(`ParentId eq ${id}`)
            .select(...LIST_SELECT)
            .expand(...LIST_EXPAND);
    };

    // const getSubtasksCache = (id: number) => {
    //     return caching.Cache.get(getSubtasksRequest(id).toRequestUrl());
    // }

    const getSubtasks = async (id: number): Promise<ITaskOverview[]> => {
        return getSubtasksRequest(id)();
    };

    const createTask = async (details: ICreateTask) => {
        const payload: ICreateTask = {
            ...details,
            EffectiveTime: 0,
            Status: 'New',
            Progress: 0,
        };
        const created = await list.items.add(payload);
        // await handleCacheTaskCreated(created.data.Id);
        await created.item.update({
            MainTaskId: created.data.Id,
        });
        // Clear the cache
        // await getAllCache().remove();
        // await getNonFinishedMainsCache().remove();
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
        const subtasks = await getSubtasks(parent.Id);
        await updateTask(parent.Id, {
            Subtasks: subtasks.length,
        });
        // Invalidate cache
        // await handleCacheTaskCreated(added.data.Id);
        // await getAllCache().remove();
        // await getSubtasksCache(parent.Id).remove();
        return added.data.Id;
    };

    const updateTask = async (
        id: number,
        details: Partial<ITaskOverview & { ResponsibleId: number }>
    ) => {
        await list.items.getById(id).update(details);
        // clear the cache
        // await getTaskCache(id).remove();
        // const updatedItem = await getTask(id);
        // await getAllCache().remove();
        // await getNonFinishedMainsCache().remove();
        // if (updatedItem.ParentId) {
        //     await getSubtasksCache(updatedItem.ParentId).remove();
        // }
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
            const subtasks = await getSubtasks(item.ParentId);
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
            const subtasks = await getSubtasks(item.ParentId);
            await updateTask(item.ParentId, {
                Subtasks: subtasks.length,
                FinishedSubtasks: subtasks.filter((s) => isFinished(s)).length,
            });
        }
    };
    //
    // const handleCacheTaskUpdated = async (id: number) => {
    //     function replace(newItem: ITaskOverview) {
    //         return (prev: ITaskOverview[]) => {
    //             return prev.map((item) =>
    //                 item.Id === newItem.Id ? newItem : item
    //             );
    //         };
    //     }
    //     // Clear cache for single item
    //     await caching.Cache.get(getTaskRequest(id).toRequestUrl()).remove();
    //     // get updated item
    //     const item = await getTask(id);
    //     // update all tasks
    //     await caching.Cache.get(getAllRequest().toRequestUrl()).set(
    //         replace(item)
    //     );
    //     if (item.ParentId) {
    //         // Update parent task
    //         await caching.Cache.get(
    //             getSubtasksRequest(item.ParentId).toRequestUrl()
    //         ).set(replace(item));
    //     } else {
    //         // Update top level tasks
    //         const cached = caching.Cache.get(getNonFinishedMainsRequest().toRequestUrl());
    //         if (!isFinished(item)) {
    //             await cached.set(replace(item));
    //         } else {
    //             await cached.remove();
    //         }
    //     }
    // };
    //
    // const handleCacheTaskCreated = async (id: number) => {
    //     function add(newItem: ITaskOverview) {
    //         return (prev: ITaskOverview[]) => {
    //             return [...prev, newItem];
    //         };
    //     }
    //     // Clear cache for single item
    //     await caching.Cache.get(getTaskRequest(id).toRequestUrl()).remove();
    //     // get updated item
    //     const item = await getTask(id);
    //     // update all tasks
    //     await caching.Cache.get(getAllRequest().toRequestUrl()).set(add(item));
    //     if (item.ParentId) {
    //         // Update parent task
    //         await caching.Cache.get(
    //             getSubtasksRequest(item.ParentId).toRequestUrl()
    //         ).remove();
    //         const subtasks = await getSubtasks(item.ParentId);
    //         await updateTask(item.ParentId, {
    //             Subtasks: subtasks.length,
    //         });
    //     } else {
    //         // Update top level tasks
    //         await caching.Cache.get(
    //             getNonFinishedMainsRequest().toRequestUrl()
    //         ).set(add(item));
    //     }
    // };

    return {
        getAll,
        getNonFinishedMains,
        getSubtasks,
        getTask,
        createTask,
        createSubtask,
        updateTask,
        finishTask,
        reopenTask,
        getTaskListId,
    };
};
