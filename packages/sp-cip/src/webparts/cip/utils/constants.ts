const VERSION = '1.0.0.36';

export const SECOND = 1000;
export const MINUTE = SECOND * 60;
export const HOUR = MINUTE * 60;
export const DAY = HOUR * 24;

export const MINUTE_DURATION = 1 / 60;

export const GROUP_LABELS_KEY = `sp-cip-group-labels-key/${VERSION}`;
export const REFRESH_PARENT_EVT = 'cip-refresh-parent-tasks-event';
export const PANEL_OPEN_EVT = 'cip-panel-open-event';
export const RELINK_PARENT_EVT = 'cip-relink-parent-event';
export const NODE_OPEN_EVT = 'cip-node-open-event';
export const TASK_ADDED_EVT = 'sp-cip-tasks-added-event';
export const TASKS_DELETED_EVT = 'sp-cip-tasks-deleted-event';
export const TASK_UPDATED_EVT = 'sp-cip-task-updated-event';
export const SUBTASK_ADDED_EVT = 'sp-cip-subtasks-added-event';
export const SUBTASK_DELETED_EVT = 'sp-cip-subtasks-deleted-event';
export const SUBTASK_UPDATED_EVT = 'sp-cip-subtask-updated-event';
export const CALLOUT_MENU_EVT = 'sp-cip-contextual-menu-event';
export const CALLOUT_ID = 'sp-cip-callout-id-main';
export const CALLOUT_ID_PANEL = 'sp-cip-callout-id-panel';
export const DIALOG_EVT = 'sp-cip-alert-dialog-event';
export const DIALOG_ID = 'sp-cip-dialog-id';
export const DIALOG_ID_PANEL = 'sp-cip-dialog-id-panel';
export const DIALOG_ID_ACTIONLOG_PANEL = 'sp-cip-dialog-id-actionlog-panel';
export const TIMER_EVT = 'sp-cip-timer-event';
export const TIMER_ADD_EVT = 'sp-cip-timer-add-event';
export const TIMER_VISIBLE_KEY = `sp-cip-timer-visible/${VERSION}`;
export const TIMER_RIGHT_POSITION = 'sp-cip-timer-right-pos';
export const TIMERS_KEY = (root: string): string =>
    `${root}/cip-timers/${VERSION}`;
export const FILTERS_ASSIGNED = 'sp-cip-filter-assigned-to';
export const ASSIGNED_CHANGE_EVT = 'sp-cip-assigned-change-event';

export const DB_NAME = 'SPFx_CIP_' + location.pathname;
export const STORE_NAME = location.origin + location.pathname + `/${VERSION}`;

export const SELECTED_TEAM_KEY = `/sp-cip-selected-team/${VERSION}`;
export const SELECTED_USERS_KEY = `/sp-cip-selected-users/${VERSION}`;
export const CATEGORIES_KEY = `/sp-cip-categories/${VERSION}`;
export const TEAM_ALL = 'All';
