import ITask from '@service/sp-tasks/dist/models/ITask';
import ITaskLog from '@service/sp-tasks/dist/models/ITaskLog';
import { DateTime, Interval } from 'luxon';
import { IPersonaProps, PersonaSize } from 'office-ui-fabric-react';
import { IUser } from '../models/IUser';
import { CHANGE_DELETE_RE, CHANGE_ROW_RE, CHANGE_TOKEN_RE } from './constants';

export const maskFormat = {
    h: /[0-2]/,
    H: /[0-9]/,
    m: /[0-5]/,
    M: /[0-9]/,
};

export interface ICustomSorting {
    [id: string]: string[];
}

export function processChangeResult(result: string, obj: { lastToken: string }) {
    const newToken = result.match(CHANGE_TOKEN_RE)[1];
    if (!obj.lastToken) {
        obj.lastToken = newToken;
        return false;
    }
    obj.lastToken = newToken;
    return CHANGE_ROW_RE.test(result) || CHANGE_DELETE_RE.test(result);
}

export function isTask(elem: ITask | ITaskLog): elem is ITask {
    return (elem as ITask).AssignedTo !== undefined;
}

export function getTaskUniqueId(elem: ITask | ITaskLog): string {
    return isTask(elem) ? `T-${elem.ID}` : `TL-${elem.ID}`;
}

export function getTaskId(elem: ITask | ITaskLog) {
    return isTask(elem) ? elem.ID : elem.Task.ID;
}

export function getTime(elem: ITask | ITaskLog) {
    if (isTask(elem)) {
        return elem.Time;
    }
    return elem.Time;
}

export function getReassignedTaskLog(log: ITaskLog, toUser: number, users: IUser[]): ITaskLog {
    const newUser = users.find((u) => u.User.ID === toUser);
    return {
        ...log,
        User: newUser.User,
    };
}

export function getSortedTaskList(
    tasks: ITask[],
    taskLogs: ITaskLog[],
    userId: number,
    customSorting: ICustomSorting = {}
): (ITask | ITaskLog)[] {
    const result: (ITask | ITaskLog)[] = [...taskLogs, ...tasks];
    result.sort((a, b) => {
        const dtA = DateTime.fromISO(getTime(a)).toISOTime();
        const dtB = DateTime.fromISO(getTime(b)).toISOTime();
        return dtA < dtB ? -1 : 1;
    });
    if (customSorting[userId.toString()] !== undefined) {
        // Map [task id]: current index
        const map = new Map(customSorting[userId.toString()].map((id, idx) => [id, idx]));
        result.sort((t1, t2) => {
            const id1 = getTaskUniqueId(t1);
            const id2 = getTaskUniqueId(t2);
            if (!map.has(id1) || !map.has(id2)) return 0;
            return map.get(id1) - map.get(id2);
        });
    }
    return result;
}

export function filterTasks<T extends ITask | ITaskLog>(
    tasks: T[],
    userId: number,
    search: string
): T[] {
    if (tasks.length === 0) return [];

    return tasks.filter((t) => {
        if (isTask(t)) {
            if (t.AssignedTo.ID !== userId) return false;
            if (
                !search ||
                t.Title.toLowerCase().indexOf(search) !== -1 ||
                t.Description && t.Description.toLowerCase().indexOf(search) !== -1
            ) {
                return true;
            }
            return false;
        }
        const log = t as ITaskLog;
        if (log.User.ID !== userId) return false;
        if (
            !search ||
            log.Title.toLowerCase().indexOf(search) !== -1 ||
            log.Description && log.Description.toLowerCase().indexOf(search) !== -1 ||
            log.Remark && log.Remark.toLowerCase().indexOf(search) !== -1 ||
            log.Status.toLowerCase().indexOf(search) !== -1
        ) {
            return true;
        }
        return false;
    });
}

/**
 * Checks whether a given date is in current workday.
 * Current workday is the period of time since 00:00 to 06:00 next calendar day.
 * If dt is today, return true
 * If dt is yesterday, check whether current local hours:
 *  before 06:00 - return true
 *  after 06:00 - return false
 * @param date Date to check
 */
export function isCurrentWorkday(dt: DateTime) {
    const today = DateTime.now();
    if (dt.hasSame(today, 'day')) return true;
    if (dt < today) {
        const interval = Interval.fromDateTimes(dt, today);
        if (interval.length('day') < 1 && today.hour < 6) return true;
    }
    return false;
}

export function userToPeoplePickerOption(user: IUser): IPersonaProps {
    return {
        id: user.User.ID.toString(),
        text: user.User.Title,
        secondaryText: user.User.EMail,
        size: PersonaSize.size24,
        imageUrl: `/_layouts/15/userphoto.aspx?AccountName=${user.User.EMail}&Size=M`,
    }
}

/**
 * @param dateStr ISO String
 * @param date Date that needs to be changed
 * @returns The date having time from @dateStr and year/month/day of @date
 */
export function changeDateTo(dateStr: string, date: Date) {
    const initial = DateTime.fromISO(dateStr);
    const dt = DateTime.fromJSDate(date);
    return initial.set({
        year: dt.year,
        month: dt.month,
        day: dt.day,
    });
}
