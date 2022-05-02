import * as React from "react";
import { ITaskOverview } from "./ITaskOverview";

export interface ITaskContext {
    open: boolean,
    setOpen: React.Dispatch<React.SetStateAction<boolean>>,
    nestLevel: number,
    task: ITaskOverview,
}

export const TaskContext = React.createContext<ITaskContext>(null);