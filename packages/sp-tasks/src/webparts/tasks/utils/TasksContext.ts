import * as React from 'react';
import ITask from '../models/ITask';

export interface ITasksContext {
    onTaskEditPanel: (open: boolean, task: ITask) => void;
    onTaskEditPanelDismiss: () => void;
    onTaskLogEditPanel: (open: boolean, task: ITask) => void;
    onTaskLogEditPanelDismiss: () => void;
}

export const TasksContext = React.createContext<ITasksContext>(null);