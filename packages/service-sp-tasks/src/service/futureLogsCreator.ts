import { DateTime } from "luxon";
import ITask from "../models/ITask";
import ITaskLog from "../models/ITaskLog";
import { TaskLogsService } from "./tasklogs";

const applicableTypes = new Set(['Monthly', 'Quarter']);

/**
 * Make sure future task logs are created.
 * This only applies to tasks of types:
 * - Monthly
 * - Quarter
 * 
 * When getting the list of tasks and task logs, also get the task logs from the future.
 * There should not be too many.
 * Now, from the tasks, separate only the ones with appropriate Types. (see above)
 * For every task of appropriate type, there should be at least one task log with a date in the future.
 * If there is not, it should be created.
 */
export async function ensureFutureTaskLogs(tasks: ITask[], logs: ITaskLog[], service: TaskLogsService): Promise<void> {
    const today = DateTime.now();
    const applicableTasks = tasks.filter((task) => applicableTypes.has(task.Type));
    for (const task of applicableTasks) {
        const taskLogs = logs.filter((log) => log.Task.ID === task.ID);
        if (!taskLogs.some((log) => DateTime.fromISO(log.Date) > today)) {
            const nextDate = getNextLogDate(task)?.toJSDate();
            if (nextDate) {
                await service.createTaskLogFromTaskOnDate(task, nextDate);
            }
        }
    }
}

/**
 * Return the next date the task should be performed.
 */
export function getNextLogDate(task: ITask): DateTime | null {
    const today = DateTime.now();
    const activeToDate = DateTime.fromISO(task.ActiveTo);
    switch (task.Type) {
        case 'Monthly':
            if (!task.MonthlyDay) return null;
            if (task.MonthlyDay <= today.day || task.MonthlyDay > today.daysInMonth) {
                let date = setDay(DateTime.now().plus({ month: 1 }), task.MonthlyDay);
                return date <= activeToDate ? date : null;
            }
            const date = setDay(today, task.MonthlyDay);
            return date <= activeToDate ? date : null;
        case 'Quarter':
            const nextQuarter = today.startOf('quarter').plus({ quarters: 1 });
            return nextQuarter <= activeToDate ? nextQuarter : null;
        default:
            throw Error(`Task type '${task.Type}' not supported`);
    }
}

function setDay(date: DateTime, day: number) {
    if (date.daysInMonth < day) {
        return date.endOf('month');
    }
    return date.set({ day: day });
}
