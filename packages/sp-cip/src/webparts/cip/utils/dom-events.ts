import { NODE_OPEN_EVT, REFRESH_TASK_EVT } from "./constants"

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

export const nodeRefreshTask = (id: number) => {
    document.dispatchEvent(new CustomEvent(REFRESH_TASK_EVT, {
        detail: {
            id,
        }
    }));
};

export const nodeRefreshTaskHandler = (id: number, func: () => void) => {
    const handler = (evt: CustomEvent) => {
        if (evt.detail && evt.detail.id === id) {
            func();
        }
    };
    document.addEventListener(REFRESH_TASK_EVT, handler);
    return () => document.removeEventListener(REFRESH_TASK_EVT, handler);
}