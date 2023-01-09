import { uniqBy } from '@microsoft/sp-lodash-subset';
import { DateTime } from 'luxon';
import * as React from 'react';
import GlobalContext from '../utils/GlobalContext';
import { selectTasks, checkTasksAndCreateTaskLogs, ensureFutureTaskLogs } from '@service/sp-tasks';
import ITask from '@service/sp-tasks/dist/models/ITask';
import ITaskLog from '@service/sp-tasks/dist/models/ITaskLog';
import { SPnotifyError } from 'sp-react-notifications';

export interface ITasksResult {
    tasks: [tasks: ITask[], setTasks: React.Dispatch<React.SetStateAction<ITask[]>>];
    taskLogs: [tasks: ITaskLog[], setTasks: React.Dispatch<React.SetStateAction<ITaskLog[]>>];
}

export const UPDATE_TASK_EVENT = 'SP_TASKS_UPDATE_TASK';
export const UPDATE_TASKLOG_EVENT = 'SP_TASKS_UPDATE_TASK_LOG';

export function updateTask(task: ITask) {
    document.dispatchEvent(
        new CustomEvent<ITask>(UPDATE_TASK_EVENT, {
            detail: task,
        })
    );
}

export function updateTaskLog(tasklog: ITaskLog) {
    document.dispatchEvent(
        new CustomEvent<ITaskLog>(UPDATE_TASKLOG_EVENT, {
            detail: tasklog,
        })
    );
}

export function useTasks(
    date: Date,
    userIds: number[],
    setLoading: (val: boolean) => void,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...deps: any[]
): ITasksResult {
    const { TaskService, TaskLogsService, currentUser } = React.useContext(GlobalContext);
    const [taskLogs, setTaskLogs] = React.useState<ITaskLog[]>([]);
    const [tasks, setTasks] = React.useState<ITask[]>([]);
    const isSameDay = React.useMemo(
        () => DateTime.fromJSDate(date).hasSame(DateTime.now(), 'day'),
        [date]
    );

    /**
     * Retrieve information from the lists
     */
    React.useEffect(() => {
        async function run() {
            try {
                // Select only valid tasks on that day
                const allTasks = await TaskService.getTasksByMultipleUserIds(userIds, date);
                const selectedTasks = selectTasks(allTasks, date);
                let logs: ITaskLog[] = [];
                if (isSameDay) {
                    logs = await TaskLogsService.getTaskLogsByUserIds(date, userIds);
                    // Get the task logs from the future and create monhtly or quarterly tasks that are missing
                    const futureLogs = await TaskLogsService.getFutureTaskLogsByUserId(
                        date,
                        currentUser.User.ID
                    );
                    await ensureFutureTaskLogs(
                        allTasks.filter((t) => t.AssignedTo.ID === currentUser.User.ID),
                        futureLogs,
                        TaskLogsService
                    );
                    const newTasks = await checkTasksAndCreateTaskLogs(
                        selectedTasks,
                        logs,
                        date,
                        TaskLogsService
                    );
                    logs = logs.concat(newTasks);
                    setTaskLogs(uniqBy(logs, (l) => l.ID));
                } else {
                    logs = await TaskLogsService.getTaskLogsByUserIds(date, userIds);
                    setTaskLogs(uniqBy(logs, (l) => l.ID));
                }
                const logSet = new Set(logs.map((log) => log.Task.ID));
                setTasks(selectedTasks.filter((task) => !logSet.has(task.ID)));
                setLoading(false);
            } catch (err) {
                SPnotifyError(err);
            }
        }
        run();
    }, [date, userIds, ...deps]);

    /**
     * Handle task updates
     */
    React.useEffect(() => {
        function handler(ev: CustomEvent<ITask>) {
            const task = ev.detail;
            const hasTaskLog = taskLogs.find((l) => l.Task.ID === task.ID) !== undefined;
            if (hasTaskLog) return;
            setTasks((prev) => {
                const taskPresent = prev.find((t) => t.ID === task.ID);
                if (taskPresent) {
                    return prev.map((t) => (t.ID !== task.ID ? t : task));
                }
                return prev.concat(task);
            });
        }
        document.addEventListener(UPDATE_TASK_EVENT, handler);
        return () => document.removeEventListener(UPDATE_TASK_EVENT, handler);
    }, [taskLogs]);

    /**
     * Handle task logs updates
     */
    React.useEffect(() => {
        function handler(ev: CustomEvent<ITaskLog>) {
            const tasklog = ev.detail;
            setTasks((prev) => prev.filter((t) => t.ID !== tasklog.Task.ID));
            setTaskLogs((prev) => {
                const logPresent = prev.find((t) => t.ID === tasklog.ID);
                if (logPresent) {
                    return prev.map((t) => (t.ID !== tasklog.ID ? t : tasklog));
                }
                return prev.concat(tasklog);
            });
        }
        document.addEventListener(UPDATE_TASKLOG_EVENT, handler);
        return () => document.removeEventListener(UPDATE_TASKLOG_EVENT, handler);
    }, []);

    return {
        tasks: [tasks, setTasks],
        taskLogs: [taskLogs, setTaskLogs],
    };
}
