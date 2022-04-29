import CipWebPart from "../CipWebPart";
import { ITask, LIST_EXPAND, LIST_SELECT } from "./ITask";

/**
 * Tasks service
 */
export const useTasks = (listName: string) => {
    const sp = CipWebPart.SPBuilder.getSP('Data');
    const list = sp.web.lists.getByTitle(listName);

    const getAll = async (): Promise<ITask[]> => {
        return list.items.select(...LIST_SELECT).expand(...LIST_EXPAND)();
    }

    const getNonFinishedMains = async (): Promise<ITask[]> => {
        const filter = `FinishDate ne null`;
        return list.items.filter(filter).select(...LIST_SELECT).expand(...LIST_EXPAND)();
    }
    
    return { getAll, getNonFinishedMains };
};
