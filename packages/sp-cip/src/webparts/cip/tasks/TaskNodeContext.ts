import * as React from "react";
import { TaskNode } from "./graph/TaskNode";

export interface ITaskNodeContext {
    open: boolean;
    node: TaskNode;
    isTaskFinished: boolean;
}

export const TaskNodeContext = React.createContext<ITaskNodeContext>({
    open: false,
    node: null,
    isTaskFinished: false,
});
