import ITask, { TaskType } from "../models/ITask";
import { getDateStatistics, getNthWorkday, getWeekDaySet, IDateStatistics } from "./utils";

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
                const wday = getNthWorkday(stats.dt);
                // If MonthylDay is 31 and it's the last working day of the month, then ok
                if (task.MonthlyDay === 31 && wday === stats.workdaysInMonth) return true;
                return task.MonthlyDay === wday;
            default:
                console.error(`Task type '${task.Type}' is not supported yet`);
                return false;
        }
    } catch {
        return false;
    }
}