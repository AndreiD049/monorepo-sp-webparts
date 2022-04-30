import * as React from "react";

export interface ITaskContext {
    open: boolean,
    setOpen: React.Dispatch<React.SetStateAction<boolean>>,
    nestLevel: number,
}

export const TaskContext = React.createContext<ITaskContext>(null);