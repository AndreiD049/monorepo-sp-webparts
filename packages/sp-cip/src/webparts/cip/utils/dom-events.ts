import { ITaskOverview } from "../tasks/ITaskOverview";
import { NODE_OPEN_EVT, PANEL_OPEN_EVT, TASKS_ADDED_EVT, TASK_UPDATED_EVT } from "./constants"

export const nodeToggleOpen = (id: number) => {
    document.dispatchEvent(new CustomEvent(NODE_OPEN_EVT, {
        detail: {
            id,
        }
    }));
};

export const nodeToggleOpenHandler = (id: number, func: () => void) => {
    const handler = (evt: CustomEvent) => {
        if (evt.detail && evt.detail.id === id) {
            func();
        }
    };
    document.addEventListener(NODE_OPEN_EVT, handler);
    return () => document.removeEventListener(NODE_OPEN_EVT, handler);;
};


export const tasksAdded = (tasks: ITaskOverview[]) => {
    document.dispatchEvent(new CustomEvent(TASKS_ADDED_EVT, {
        detail: {
            tasks,
        }
    }));
};

export const taskAddedHandler = (func: (tasks: ITaskOverview[]) => void) => {
    const handler = (evt: CustomEvent) => {
        if (evt.detail && evt.detail.tasks.length > 0) {
            func(evt.detail.tasks);
        }
    };
    document.addEventListener(TASKS_ADDED_EVT, handler);
    return () => document.removeEventListener(TASKS_ADDED_EVT, handler);
}

export const taskUpdated = (task: ITaskOverview) => {
    document.dispatchEvent(new CustomEvent(TASK_UPDATED_EVT, {
        detail: {
            task
        }
    }));
};

export const taskUpdatedHandler = (func: (task: ITaskOverview) => void) => {
    const handler = (evt: CustomEvent) => {
        if (evt.detail && evt.detail.task) {
            func(evt.detail.task);
        }
    };
    document.addEventListener(TASK_UPDATED_EVT, handler);
    return () => document.removeEventListener(TASK_UPDATED_EVT, handler);
}

export const openPanel = (panelId: string, open: boolean, props?: any) => {
    document.dispatchEvent(
        new CustomEvent(PANEL_OPEN_EVT, {
            detail: {
                id: panelId,
                open,
                props,
            },
        })
    );
};

export const openPanelHandler = (id: string, func: (open: boolean, props?: any) => void) => {
    const handler = (evt: CustomEvent) => {
        if (evt.detail && evt.detail.id === id) {
            func(evt.detail.open, evt.detail.props);
        }
    };

    document.addEventListener(PANEL_OPEN_EVT, handler);
    return () => document.removeEventListener(PANEL_OPEN_EVT, handler);
}