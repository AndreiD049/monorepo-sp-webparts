import { DateTime, Interval } from "luxon";
import ITask, { TaskType, WeekDay, WeekDayMap } from "./models/ITask";
import ITaskLog from "./models/ITaskLog";
import { TaskLogsService } from "./service/tasklogs";

export function isTask(elem: ITask | ITaskLog): elem is ITask {
    return (elem as ITask).AssignedTo !== undefined;
}

/**
 * Matches the tasks with the task logs.
 * If there are tasks without match, a task log is created from them.
 * Then, the newly created tasks are retrieved from the list and returned to the client
 *
 * @param tasks - the list of tasks assigned to current user
 * @param logs - the list of concrete task logs currently created from assigned tasks
 * @returns newly created logs
 */
export async function checkTasksAndCreateTaskLogs(
    tasks: ITask[],
    logs: ITaskLog[],
    date: Date,
    logService: TaskLogsService
) {
    let missing: ITask[] = [];
    let logSet = new Set(logs.map((log) => log.Task.ID));
    tasks.forEach((task) => {
        if (!logSet.has(task.ID)) {
            missing.push(task);
        }
    });
    const results = await logService.createTaskLogs(missing, date);
    let newLogs = results.length === 0 ? [] : await logService.getTaskLogsFromAddResult(results);
    return newLogs;
}

export interface IDateStatistics {
    dt: DateTime;
    isWorkDay: boolean;
    weekday: number;
    daysInMonth: number;
    workdaysInMonth: number;
    nthDay: number;
    nthWorkday: number;
}

export function getDateStatistics(date: Date): IDateStatistics {
    const dt = DateTime.fromJSDate(date);
    const result: IDateStatistics = {
        dt,
        weekday: dt.weekday,
        isWorkDay: dt.weekday < 6,
        daysInMonth: dt.daysInMonth,
        workdaysInMonth: getNumberOfWorkdaysInMonth(dt),
        nthDay: dt.day,
        nthWorkday: getNthWorkday(dt),
    };
    return result;
}

export function getNumberOfWorkdaysInMonth(dt: DateTime): number {
    // We get the weekday, 1 is Monday and 7 is Sunday.
    // It can be any day from 1 to 7
    // Thus, i can calculate number of workdays in the first week of the month
    // Ex: weekday is Tue = 2 => 7 - 2 + 1 = 6 days in the first week
    // It means number of workdays will be = daysInFirstWeek - 2, or 0 if < 0
    const daysInFirstWeek = 7 - dt.startOf('month').weekday + 1;
    // Then we can calculate number of days in the rest of the month
    // without first week, so we can calculate number of full weeks
    // Ex: having a 31 day month and 5 days in first week, we get
    // 31 - 5 = 26 days without first week
    const daysWithoutFirstWeek = dt.daysInMonth - daysInFirstWeek;
    // Now we can know the number of full weeks
    // Each full week has 5 workdays
    // Ex: floor(26 / 7) = 3 full weeks
    const fullWeeks = Math.floor(daysWithoutFirstWeek / 7);
    // And we can get the amount of remaining days at the end of the month
    // that do not form a full week, for example monday till Thursday
    // The amount of workdays is always equal to min(5, number of days in the week)
    // Ex: 26 mod 7 = 5 days remaining
    const lastWeekDays = daysWithoutFirstWeek % 7;
    // Now we can calculate the result
    // Ex: max(daysInFirstWeek - 2, 0) + fullWeeks * 5 + min(lastWeekDays, 5);
    return Math.max(daysInFirstWeek - 2, 0) + fullWeeks * 5 + Math.min(lastWeekDays, 5);
}

export function getNthWorkday(dt: DateTime): number {
    // if day is in weekend, return 0
    if (dt.weekday > 5) return 0;
    const firstDay = dt.startOf('month');
    const daysInFirstWeek = 7 - firstDay.weekday + 1;

    // Only if day is in the first week
    if (dt.day < daysInFirstWeek) {
        return dt.weekday - firstDay.weekday + 1;
    }

    const fullWeeks = Math.floor((dt.day - daysInFirstWeek) / 7);

    return Math.max(daysInFirstWeek - 2, 0) + fullWeeks * 5 + Math.min(dt.weekday, 5);
}

export function getWeekDaySet(daysList: WeekDay[]): Set<number> {
    return new Set(daysList.map((d) => WeekDayMap[d]));
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

/**
 * @param list list of tasks
 * @param date date that is being analyzed
 * @returns A list of tasks that are valid for that date
 */
export function selectTasks(list: ITask[], date: Date): ITask[] {
    const stats = getDateStatistics(date);
    return list.filter((task) => isTaskValid(task, stats));
}

export function isTaskValid(task: ITask, stats: IDateStatistics) {
    try {
        switch (task.Type) {
            case TaskType.Daily:
                return stats.isWorkDay
            case TaskType.Weekly:
                const daySet = getWeekDaySet(task.WeeklyDays);
                return daySet.has(stats.weekday);
            case TaskType.Monthly:
                // if day is weekend, not applicable
                if (stats.dt.weekday > 5) return false;
                // if current monthly date is before 3rd date, check also previous month
                if (stats.nthDay <= 3) {
                    const prevMonth = stats.dt.minus({ month: 1 }).set({ day: task.MonthlyDay });
                    // check if task in previous month was in weekend
                    if (prevMonth.weekday > 5) {
                        // new date when task needs to be performed
                        const newTaskDate = prevMonth.plus({ days: 8 - prevMonth.weekday });
                        if (newTaskDate.hasSame(stats.dt, 'day')) return true;
                    }
                }
                // current month
                const currentMonth = stats.dt.set({ day: task.MonthlyDay });
                let day = task.MonthlyDay;
                if (currentMonth.weekday > 5) {
                    day = currentMonth.plus({ days: 8 - currentMonth.weekday }).day;
                }
                if (day === 31 && stats.nthDay === stats.daysInMonth) return true;
                return day === stats.nthDay;
            default:
                console.error(`Task type '${task.Type}' is not supported yet`);
                return false;
        }
    } catch {
        return false;
    }
}