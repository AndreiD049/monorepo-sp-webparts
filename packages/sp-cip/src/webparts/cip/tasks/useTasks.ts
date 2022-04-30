import { useContext } from "react";
import CipWebPart from "../CipWebPart";
import { GlobalContext } from "../utils/GlobalContext";
import { ITask, LIST_EXPAND, LIST_SELECT } from "./ITask";

/**
 * Tasks service
 */
export const useTasks = () => {
    const ctx = useContext(GlobalContext);
    const sp = CipWebPart.SPBuilder.getSP('Data');
    const list = sp.web.lists.getByTitle(ctx.properties.tasksListName);

    const getAll = async (): Promise<ITask[]> => {
        return list.items.select(...LIST_SELECT).expand(...LIST_EXPAND)();
    }

    const getNonFinishedMains = async (): Promise<ITask[]> => {
        const filter = `FinishDate eq null and Parent eq null`;
        return list.items.filter(filter).select(...LIST_SELECT).expand(...LIST_EXPAND)();
    }
    
    return { getAll, getNonFinishedMains };
};
