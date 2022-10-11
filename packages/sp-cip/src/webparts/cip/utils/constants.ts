export const SECOND = 1000;
export const MINUTE = SECOND * 60;
export const HOUR = MINUTE * 60;
export const DAY = HOUR * 24;

export const MINUTE_DURATION = 1 / 60;

export const GROUP_LABELS_KEY = 'sp-cip-group-labels-key';
export const REFRESH_PARENT_EVT ='cip-refresh-parent-tasks-event';
export const PANEL_OPEN_EVT ='cip-panel-open-event';
export const RELINK_PARENT_EVT ='cip-relink-parent-event';
export const NODE_OPEN_EVT ='cip-node-open-event';
export const TASKS_ADDED_EVT = 'sp-cip-tasks-added-event';
export const TASKS_DELETED_EVT = 'sp-cip-tasks-deleted-event';
export const TASK_UPDATED_EVT = 'sp-cip-task-updated-event';
export const GET_SUBTASKS_EVT = 'sp-cip-get-subtasks-event';
export const CALLOUT_MENU_EVT = 'sp-cip-contextual-menu-event';
export const DIALOG_EVT = 'sp-cip-alert-dialog-event';
export const TIMER_EVT = 'sp-cip-timer-event';
export const TIMER_ADD_EVT = 'sp-cip-timer-add-event';
export const TIMER_VISIBLE_KEY = 'sp-cip-timer-visible';
export const TIMER_RIGHT_POSITION = 'sp-cip-timer-right-pos';
export const TIMERS_KEY = (root: string) => `${root}/cip-timers`;
export const FILTERS_ASSIGNED = 'sp-cip-filter-assigned-to';

export const DB_NAME = 'SPFx_CIP';
export const STORE_NAME = location.origin + location.pathname;
export const ALL_TASKS_KEY = 'allTasks';

export const SELECTED_TEAM_KEY = '/sp-cip-selected-team';
export const TEAM_ALL = 'All';
