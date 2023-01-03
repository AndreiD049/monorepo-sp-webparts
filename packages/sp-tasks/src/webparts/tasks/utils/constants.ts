export const MINUTE = 1000 * 60;
export const HOUR = MINUTE * 60;
export const USER_WEB_RE = /^(.*sharepoint.com\/(sites|teams)\/.*)\/Lists/;
export const CHANGE_TOKEN_RE = /LastChangeToken=['"](.*?)['"]/;
export const CHANGE_ROW_RE = /<.?:row/;
export const CHANGE_DELETE_RE = /<Id ChangeType=['"]Delete['"]/;
export const ACCESS_EDIT_OTHERS = 'edit-others';
export const ACCESS_SEE_ALL = 'see-all-users';

export const MAIN_CALLOUT = 'sp-tasks-main-callout';