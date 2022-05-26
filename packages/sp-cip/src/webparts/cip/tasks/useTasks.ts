import { useContext } from 'react';
import { IndexedDBCacher } from 'sp-indexeddb-caching';
import CipWebPart from '../CipWebPart';
import { GlobalContext } from '../utils/GlobalContext';
import { ICreateTask } from './ITaskDetails';
import { ITaskOverview, LIST_EXPAND, LIST_SELECT } from './ITaskOverview';

/**
 * Tasks service
 */
export const useTasks = () => {
    const ctx = useContext(GlobalContext);
    const caching = IndexedDBCacher();
    const sp = CipWebPart.SPBuilder.getSP('Data').using(
        caching.CachingTimeline
    );
    const list = sp.web.lists.getByTitle(ctx.properties.tasksListName);

    const getAllRequest = () =>
        list.items.select(...LIST_SELECT).expand(...LIST_EXPAND);
    const getAll = async (): Promise<ITaskOverview[]> => {
        return getAllRequest()();
    };

    const getTaskRequest = (id: number) =>
        list.items
            .getById(id)
            .select(...LIST_SELECT)
            .expand(...LIST_EXPAND);
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
    const getNonFinishedMains = async (): Promise<ITaskOverview[]> => {
        return getNonFinishedMainsRequest()();
    };

    const getSubtasksRequest = (id: number) => {
        return list.items
            .filter(`ParentId eq ${id}`)
            .select(...LIST_SELECT)
            .expand(...LIST_EXPAND);
    };
    const getSubtasks = async (id: number): Promise<ITaskOverview[]> => {
        return getSubtasksRequest(id)();
    };

    const setSubtasks = async (parentId: number, subtasks: number[]) => {
        return list.items.getById(parentId).update({
            SubtasksId: subtasks,
        });
    };

    const createTask = async (details: ICreateTask) => {
        const payload: ICreateTask = {
            ...details,
            EffectiveTime: 0,
            Status: 'New',
            Progress: 0,
        };
        const created = await list.items.add(payload);
        await handleCacheTaskCreated(created.data.Id);
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
        // Invalidate cache
        await handleCacheTaskCreated(added.data.Id);
        return added.data.Id;
    };

    const updateTask = async (id: number, details: Partial<ITaskOverview & {ResponsibleId: number}>) => {
        const updated = await list.items.getById(id).update(details);
        await handleCacheTaskUpdated(id);
    };

    const handleCacheTaskUpdated = async (id: number) => {
        function replace(newItem: ITaskOverview) {
            return (prev: ITaskOverview[]) => {
                return prev.map((item) =>
                    item.Id === newItem.Id ? newItem : item
                );
            };
        }
        // Clear cache for single item
        await caching.Cache.get(getTaskRequest(id).toRequestUrl()).remove();
        // get updated item
        const item = await getTask(id);
        // update all tasks
        await caching.Cache.get(getAllRequest().toRequestUrl()).set(
            replace(item)
        );
        if (item.ParentId) {
            // Update parent task
            await caching.Cache.get(
                getSubtasksRequest(item.ParentId).toRequestUrl()
            ).set(replace(item));
        } else {
            // Update top level tasks
            await caching.Cache.get(
                getNonFinishedMainsRequest().toRequestUrl()
            ).set(replace(item));
        }
    };

    const handleCacheTaskCreated = async (id: number) => {
        function add(newItem: ITaskOverview) {
            return (prev: ITaskOverview[]) => {
                return [...prev, newItem];
            };
        }
        // Clear cache for single item
        await caching.Cache.get(getTaskRequest(id).toRequestUrl()).remove();
        // get updated item
        const item = await getTask(id);
        console.log(item);
        // update all tasks
        await caching.Cache.get(getAllRequest().toRequestUrl()).set(
            add(item)
        );
        if (item.ParentId) {
            // Update parent task
            await caching.Cache.get(
                getSubtasksRequest(item.ParentId).toRequestUrl()
            ).remove();
            const subtasks = await getSubtasks(item.ParentId);
            await setSubtasks(item.ParentId, [...subtasks.map((s) => s.Id), item.Id]);
        } else {
            // Update top level tasks
            await caching.Cache.get(
                getNonFinishedMainsRequest().toRequestUrl()
            ).set(add(item));
        }
    }

    return {
        getAll,
        getNonFinishedMains,
        getSubtasks,
        getTask,
        createTask,
        createSubtask,
        updateTask,
    };
};
