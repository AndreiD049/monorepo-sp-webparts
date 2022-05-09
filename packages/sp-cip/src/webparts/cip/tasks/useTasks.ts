import { useContext } from "react";
import { IndexedDBCacher } from "sp-indexeddb-caching";
import { Caching, getHashCode } from "sp-preset";
import CipWebPart from "../CipWebPart";
import { GlobalContext } from "../utils/GlobalContext";
import { ITaskOverview, LIST_EXPAND, LIST_SELECT } from "./ITaskOverview";

const clearCache = (val: string) => {
    const hashed = getHashCode(val).toString();
    localStorage.removeItem(hashed);
}

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
    
    return { getAll, getNonFinishedMains, getSubtasks };
};
