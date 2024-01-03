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
    TASK_ADDED_EVT,
    TASK_UPDATED_EVT,
    TASKS_DELETED_EVT,
    TIMER_EVT,
    TIMER_ADD_EVT,
    SUBTASK_ADDED_EVT,
    SUBTASK_UPDATED_EVT,
    SUBTASK_DELETED_EVT,
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
 *	 Subtasks handling events
 */
// Subtask added
const SUBTASK_ADDED_EVT_ID = (parentId: number): string => `${SUBTASK_ADDED_EVT}${parentId}`;

const subtaskAdded = (task: ITaskOverview): void => {
	if (!task.ParentId) return;

	const eventId = SUBTASK_ADDED_EVT_ID(task.ParentId);

    document.dispatchEvent(
        new CustomEvent(eventId, {
            detail: {
                task,
            },
        })
    );
};
export const subtasksAddedHandler = (parentId: number, func: (task: ITaskOverview) => void): () => void => {
	const handler = (evt: CustomEvent): void => {
		if (evt.detail && evt.detail.task) {
			func(evt.detail.task);
		}
	}
	const eventId = SUBTASK_ADDED_EVT_ID(parentId);
	document.addEventListener(eventId, handler);
	return () => document.removeEventListener(eventId, handler);
}

// Subtask updated
const SUBTASK_UPDATED_EVT_ID = (parentId: number): string => `${SUBTASK_UPDATED_EVT}${parentId}`;

const subtaskUpdated = (task: ITaskOverview): void => {
	if (!task.ParentId) return;

	const eventId = SUBTASK_UPDATED_EVT_ID(task.ParentId);

	document.dispatchEvent(
		new CustomEvent(eventId, {
			detail: {
				task,
			},
		})
	);
};

export const subtasksUpdatedHandler = (parentId: number, func: (task: ITaskOverview) => void): () => void => {
	const handler = (evt: CustomEvent): void => {
		if (evt.detail && evt.detail.task) {
			func(evt.detail.task);
		}
	}
	const eventId = SUBTASK_UPDATED_EVT_ID(parentId);
	document.addEventListener(eventId, handler);
	return () => document.removeEventListener(eventId, handler);
}

// Subtask deleted
const SUBTASK_DELETED_EVT_ID = (parentId: number): string => `${SUBTASK_DELETED_EVT}${parentId}`;

const subtaskDeleted = (parentId: number, taskId: number): void => {
	const eventId = SUBTASK_DELETED_EVT_ID(parentId);

	document.dispatchEvent(
		new CustomEvent(eventId, {
			detail: {
				taskId,
			},
		})
	);
};

export const subtasksDeletedHandler = (parentId: number, func: (taskId: number) => void): () => void => {
	const handler = (evt: CustomEvent): void => {
		if (evt.detail && evt.detail.taskId) {
			func(evt.detail.taskId);
		}
	}
	const eventId = SUBTASK_DELETED_EVT_ID(parentId);
	document.addEventListener(eventId, handler);
	return () => document.removeEventListener(eventId, handler);
}

/**
 * Handle new tasks added
 */
export const taskAdded = (task: ITaskOverview): void => {
	if (task.ParentId) {
		subtaskAdded(task);
	}
    document.dispatchEvent(
        new CustomEvent(TASK_ADDED_EVT, {
            detail: {
                task: task,
            },
        })
    );
};

export const taskAddedHandler = (func: (task: ITaskOverview) => void): () => void => {
    const handler = (evt: CustomEvent): void => {
        if (evt.detail && evt.detail.task) {
            func(evt.detail.task);
        }
    };
    document.addEventListener(TASK_ADDED_EVT, handler);
    return () => document.removeEventListener(TASK_ADDED_EVT, handler);
};

/**
 * Handle tasks deleted
 */
export const taskDeleted = (task: ITaskOverview): void => {
	if (task.ParentId) {
		subtaskDeleted(task.ParentId, task.Id);
	}

    document.dispatchEvent(
        new CustomEvent(TASKS_DELETED_EVT, {
            detail: {
                taskId: task.Id,
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
    return () => document.removeEventListener(TASK_ADDED_EVT, handler);
};

/**
 * Handle task details updated
 */
export const taskUpdated = (task: ITaskOverview): void => {
	if (task.ParentId) {
		subtaskUpdated(task);
	}
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
