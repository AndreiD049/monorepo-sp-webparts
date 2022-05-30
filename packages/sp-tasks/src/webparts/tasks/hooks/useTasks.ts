import { uniqBy } from '@microsoft/sp-lodash-subset';
import { DateTime } from 'luxon';
import * as React from 'react';
import { useState } from 'react';
import ITask from '../models/ITask';
import ITaskLog from '../models/ITaskLog';
import GlobalContext from '../utils/GlobalContext';
import { selectTasks } from '../utils/select-tasks';
import { checkTasksAndCreateTaskLogs } from '../utils/utils';

export interface ITasksResult {
    tasks: [tasks: ITask[], setTasks: React.Dispatch<React.SetStateAction<ITask[]>>];
    taskLogs: [tasks: ITaskLog[], setTasks: React.Dispatch<React.SetStateAction<ITaskLog[]>>];
    descriptions: Map<number, string>
}

export function useTasks(
    date: Date,
    userIds: number[],
    setLoading: (val: boolean) => void,
    ...deps
): ITasksResult {
    const { TaskService, TaskLogsService } = React.useContext(GlobalContext);
    const [taskLogs, setTaskLogs] = React.useState<ITaskLog[]>([]);
    const [tasks, setTasks] = React.useState<ITask[]>([]);
    const [descriptions, setDescriptions] = React.useState<Map<number, string>>(null);
    const isSameDay = React.useMemo(
        () => DateTime.fromJSDate(date).hasSame(DateTime.now(), 'day'),
        [date]
    );

    /**
     * Retrieve information from the lists
     */
    React.useEffect(() => {
        async function run() {
            // Select only valid tasks on that day
            const tasks = selectTasks(await TaskService.getTasksByMultipleUserIds(userIds), date);
            const taskDescriptions = new Map(tasks.map((t) => [t.ID, t.Description]));
            setDescriptions(taskDescriptions);
            let logs: ITaskLog[] = [];
            if (isSameDay) {
                logs = await TaskLogsService.getTaskLogsByUserIds(date, userIds);
                const newTasks = await checkTasksAndCreateTaskLogs(
                    tasks,
                    logs,
                    date,
                    TaskLogsService
                );
                logs = logs.concat(newTasks).map((log) => {
                    log.Description = taskDescriptions.get(log.Task.ID);
                    return log;
                });
                setTaskLogs(uniqBy(logs, (l) => l.ID));
            } else {
                logs = (await TaskLogsService.getTaskLogsByUserIds(date, userIds)).map((log) => {
                    log.Description = taskDescriptions.get(log.Task.ID);
                    return log;
                });
                setTaskLogs(uniqBy(logs, (l) => l.ID));
            }
            const logSet = new Set(logs.map((log) => log.Task.ID));
            setTasks(tasks.filter((task) => !logSet.has(task.ID)));
            setLoading(false);
        }
        run();
    }, [date, userIds, ...deps]);

    return {
        tasks: [tasks, setTasks],
        taskLogs: [taskLogs, setTaskLogs],
        descriptions,
    };
}
