import {
    ButtonType,
    ICalloutProps,
    IDialogContentProps,
} from 'office-ui-fabric-react';
import * as React from 'react';
import { ITaskOverview } from '@service/sp-cip/dist/models/ITaskOverview';
import {
    CALLOUT_MENU_EVT,
    DIALOG_EVT,
    NODE_OPEN_EVT,
    PANEL_OPEN_EVT,
    RELINK_PARENT_EVT,
    TASKS_ADDED_EVT,
    TASK_UPDATED_EVT,
    GET_SUBTASKS_EVT,
    TASKS_DELETED_EVT,
    TIMER_EVT,
    TIMER_ADD_EVT,
} from './constants';

/**
 *  Open/Close toggle
 */
export const nodeSetOpen = (id: number, value?: boolean): void => {
    document.dispatchEvent(
        new CustomEvent(NODE_OPEN_EVT, {
            detail: {
                id,
                value,
            },
        })
    );
};

export const nodeToggleOpenHandler = (id: number, func: (val?: boolean) => void): () => void => {
    const handler = (evt: CustomEvent): void => {
        if (evt.detail && evt.detail.id === id) {
            func(evt.detail.value);
        }
    };
    document.addEventListener(NODE_OPEN_EVT, handler);
    return () => document.removeEventListener(NODE_OPEN_EVT, handler);
};

/**
 * Relink parent
 */
export const relinkParent = (id: number | 'all'): void => {
    document.dispatchEvent(
        new CustomEvent(RELINK_PARENT_EVT, {
            detail: {
                id,
            },
        })
    );
};

export const relinkParentHandler = (id: number, func: () => void): () => void => {
    const handler = (evt: CustomEvent): void => {
        if (evt.detail?.id === id || evt.detail?.id === 'all') {
            func();
        }
    };
    document.addEventListener(RELINK_PARENT_EVT, handler);
    return () => document.removeEventListener(RELINK_PARENT_EVT, handler);
};

/**
 * Handle new tasks added
 */
export const tasksAdded = (tasks: ITaskOverview[]): void => {
    document.dispatchEvent(
        new CustomEvent(TASKS_ADDED_EVT, {
            detail: {
                tasks,
            },
        })
    );
};

export const taskAddedHandler = (func: (tasks: ITaskOverview[]) => void): () => void => {
    const handler = (evt: CustomEvent): void => {
        if (evt.detail && evt.detail.tasks.length > 0) {
            func(evt.detail.tasks);
        }
    };
    document.addEventListener(TASKS_ADDED_EVT, handler);
    return () => document.removeEventListener(TASKS_ADDED_EVT, handler);
};

/**
 * Handle new tasks added
 */
export const taskDeleted = (taskId: number): void => {
    document.dispatchEvent(
        new CustomEvent(TASKS_DELETED_EVT, {
            detail: {
                taskId: taskId,
            },
        })
    );
};

export const taskDeletedHandler = (func: (taskId: number) => void): () => void => {
    const handler = (evt: CustomEvent): void => {
        if (evt.detail && evt.detail.taskId) {
            func(evt.detail.taskId);
        }
    };
    document.addEventListener(TASKS_DELETED_EVT, handler);
    return () => document.removeEventListener(TASKS_ADDED_EVT, handler);
};

/**
 * Handle task details updated
 */
export const taskUpdated = (task: ITaskOverview): void => {
    document.dispatchEvent(
        new CustomEvent(TASK_UPDATED_EVT, {
            detail: {
                task,
            },
        })
    );
};

export const taskUpdatedHandler = (func: (task: ITaskOverview) => void): () => void => {
    const handler = (evt: CustomEvent): void => {
        if (evt.detail && evt.detail.task) {
            func(evt.detail.task);
        }
    };
    document.addEventListener(TASK_UPDATED_EVT, handler);
    return () => document.removeEventListener(TASK_UPDATED_EVT, handler);
};

export interface IGetSubtasksProps {
    parent: ITaskOverview;
}

export const getSubtasks = (parent: ITaskOverview): void => {
    document.dispatchEvent(
        new CustomEvent<IGetSubtasksProps>(GET_SUBTASKS_EVT, {
            detail: {
                parent,
            }
        })
    );
};

export const getSubtasksHandler = (func: (parent: ITaskOverview) => void): () => void => {
    const handler = (evt: CustomEvent<IGetSubtasksProps>): void => {
        if (evt.detail && evt.detail.parent) {
            func(evt.detail.parent);
        }
    };
    document.addEventListener(GET_SUBTASKS_EVT, handler);
    return () => document.removeEventListener(GET_SUBTASKS_EVT, handler);
};

/**
 * Handle panel opened
 */
export const openPanel = (panelId: string, open: boolean, props?: {}): void => {
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

export const openPanelHandler = (
    id: string,
    func: (open: boolean, props?: {}) => void
): () => void => {
    const handler = (evt: CustomEvent): void => {
        if (evt.detail && evt.detail.id === id) {
            func(evt.detail.open, evt.detail.props);
        }
    };

    document.addEventListener(PANEL_OPEN_EVT, handler);
    return () => document.removeEventListener(PANEL_OPEN_EVT, handler);
};

/**
 * Handle callout menu opened
 */
export interface ICalloutEventProps<T> extends ICalloutProps {
    visible: boolean;
    componentProps?: T;
    RenderComponent?: React.FunctionComponent<T>;
}
export const calloutVisibility = <T>(props: ICalloutEventProps<T>): void => {
    document.dispatchEvent(
        new CustomEvent(CALLOUT_MENU_EVT, {
            detail: {
                props,
            },
        })
    );
};

export const calloutVisibilityHandler = (
    func: <T>(props: ICalloutEventProps<T>) => void
): () => void => {
    const handler = (evt: CustomEvent): void => {
        if (evt.detail?.props) {
            func(evt.detail.props);
        }
    };
    document.addEventListener(CALLOUT_MENU_EVT, handler);
    return () => document.removeEventListener(CALLOUT_MENU_EVT, handler);
};

/** Handle dialogs */

export interface IDialogButtonProp {
    type?: ButtonType.primary | ButtonType.default;
    key: string;
    text: string;
}
export interface IDialogVisibilityProps {
    alertId: string;
    hidden: boolean;
    onBeforeDismiss?: (answer: string) => void
    contentProps: IDialogContentProps;
    buttons: IDialogButtonProp[];
    Component?: JSX.Element;
}

export const dialogVisibility = (props: IDialogVisibilityProps): void => {
    document.dispatchEvent(
        new CustomEvent(DIALOG_EVT, {
            detail: {
                props,
            },
        })
    );
};

export const dialogVisibilityHandler = (
    func: (props: IDialogVisibilityProps) => void
): () => void => {
    const handler = (evt: CustomEvent): void => {
        if (evt.detail?.props) {
            func(evt.detail.props);
        }
    };
    document.addEventListener(DIALOG_EVT, handler);
    return () => document.removeEventListener(DIALOG_EVT, handler);
};

/**
 *  Timer events
 */
export interface ITimerEventOptions {
    visible: boolean;
}

export const setTimerOptions = (options: ITimerEventOptions): void => {
    document.dispatchEvent(
        new CustomEvent<ITimerEventOptions>(TIMER_EVT, {
            detail: options,
        })
    );
};

export const timerOptionsHandler = (func: (options: ITimerEventOptions) => void): () => void => {
    const handler = (evt: CustomEvent): void => {
        if (evt.detail) {
            func(evt.detail);
        }
    };
    document.addEventListener(TIMER_EVT, handler);
    return () => document.removeEventListener(TIMER_EVT, handler);
};

export interface ITimerAddEventOptions {
    task?: ITaskOverview;
}

export const addTimer = (options: ITimerAddEventOptions): void => {
    document.dispatchEvent(
        new CustomEvent<ITimerAddEventOptions>(TIMER_ADD_EVT, {
            detail: options,
        })
    );
}

export const timerAddHandler = (func: (options: ITimerAddEventOptions) => void): () => void => {
    const handler = (evt: CustomEvent): void => {
        if (evt.detail) {
            func(evt.detail);
        }
    };
    document.addEventListener(TIMER_ADD_EVT, handler);
    return () => document.removeEventListener(TIMER_ADD_EVT, handler);
};
