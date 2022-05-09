import { useContext } from "react";
import { IndexedDBCacher } from "sp-indexeddb-caching";
import { Caching, getHashCode } from "sp-preset";
import CipWebPart from "../CipWebPart";
import { GlobalContext } from "../utils/GlobalContext";
import { ICreateTask } from "./ITaskDetails";
import { ITaskOverview, LIST_EXPAND, LIST_SELECT } from "./ITaskOverview";

/**
 * Tasks service
 */
export const useTasks = () => {
    const ctx = useContext(GlobalContext);
    const caching = IndexedDBCacher();
    const sp = CipWebPart.SPBuilder.getSP('Data').using(caching.CachingTimeline);
    const list = sp.web.lists.getByTitle(ctx.properties.tasksListName);

    const getAllRequest = () => list.items.select(...LIST_SELECT).expand(...LIST_EXPAND);
    const getAll = async (): Promise<ITaskOverview[]> => {
        return getAllRequest()();
    }

    const getTaskRequest = (id: number) => list.items.getById(id).select(...LIST_SELECT).expand(...LIST_EXPAND);
    const getTask = async (id: number): Promise<ITaskOverview> => {
        return getTaskRequest(id)();
    }

    const getNonFinishedMainsRequest = () => {
        const filter = `FinishDate eq null and Parent eq null`;
        return list.items.filter(filter).select(...LIST_SELECT).expand(...LIST_EXPAND);
    }
    const getNonFinishedMains = async (): Promise<ITaskOverview[]> => {
        return getNonFinishedMainsRequest()();
    }

    const getSubtasksRequest = (id: number) => {
        return list.items.filter(`ParentId eq ${id}`).select(...LIST_SELECT).expand(...LIST_EXPAND);
    }
    const getSubtasks = async (id: number): Promise<ITaskOverview[]> => {
        return getSubtasksRequest(id)();
    }

    const setSubtasks = async (parentId: number, subtasks: number[]) => {
        return list.items.getById(parentId).update({
            SubtasksId: subtasks,
        });
    }

    const createTask = async (details: ICreateTask) => {
        const payload: ICreateTask = {
            ...details,
            Team: '',
            EffectiveTime: 0,
            Status: 'New',
            Progress: 0,
        };
        const created = await list.items.add(payload);
        return created.item.update({
            MainTaskId: created.data.Id,
        });
    };

    const createSubtask = async (details: ICreateTask, parent: ITaskOverview) => {
        const payload: ICreateTask = {
            ...details,
            Team: '',
            EffectiveTime: 0,
            Status: 'New',
            Progress: 0,
            ParentId: parent.Id,
            MainTaskId: parent.MainTaskId,
        }
        const added = await list.items.add(payload);
        return setSubtasks(parent.Id, [...parent.SubtasksId, added.data.Id]);
    }
    
    return { getAll, getNonFinishedMains, getSubtasks, getTask, createTask, createSubtask };
};
