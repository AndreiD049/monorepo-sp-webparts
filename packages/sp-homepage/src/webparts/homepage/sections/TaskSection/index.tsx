import { flatten } from '@microsoft/sp-lodash-subset';
import { Text } from 'office-ui-fabric-react';
import * as React from 'react';
import { ExpandHeader } from '../../components/ExpandHeader';
import { NoData } from '../../components/NoData';
import { ISectionProps } from '../../components/Section';
import { TaskStatus } from '../../components/TaskStatus';
import ITaskItem from '../../models/ITaskItem';
import ITaskLogItem from '../../models/ITaskLogItem';
import SourceService, { clearCache, createServices } from '../../services/SourceService';
import { DateTime } from 'luxon';
import styles from './TaskSection.module.scss';
import { checkSourceTypes, getMonthDayLabel, taskSorter } from '../../utils';
import { listenSectionEvent } from '../../components/Section/section-events';
import { LoadingSpinner } from '../../components/LoadingSpinner';

const selectLogs = ['Id', 'Status', 'Title', 'Time', 'Date', 'TaskId'];
const selectTasks = [
    'Id',
    'AssignedToId',
    'Title',
    'Type',
    'WeeklyDays',
    'MonthlyDay',
    'Time',
    'DaysDuration',
    'Transferable',
    'ActiveFrom',
    'ActiveTo',
];
const daysMap: { [key: string]: number } = {
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6,
    Sunday: 0,
};
export interface ITaskSectionProps extends ISectionProps {
    // Props go here
}

interface ITaskProps {
    task: ITaskItem;
    taskLog?: ITaskLogItem;
    weekylDay?: string;
}

const findTaskLog = (
    task: ITaskItem,
    taskLogs?: ITaskLogItem[],
    weekDay?: string
): ITaskLogItem | undefined => {
    if (!taskLogs) return null;
    if (task.Type === 'Weekly' && weekDay) {
        return taskLogs.find((t) => DateTime.fromISO(t.Date).get('weekday') === daysMap[weekDay]);
    }
    return taskLogs[0];
};

const Task: React.FC<ITaskProps> = (props) => {
    const status = React.useMemo(() => {
        if (props.taskLog) {
            if (props.task.Type === 'Weekly' && props.weekylDay) {
                const currentTaskDay = DateTime.fromISO(props.taskLog.Date).toFormat('EEEE');
                if (currentTaskDay === props.weekylDay) {
                    return props.taskLog.Status;
                }
                return 'Unknown';
            }
            return props.taskLog.Status;
        }
        return 'Unknown';
    }, []);

    return (
        <tr className={styles.task}>
            <td>
                <TaskStatus status={status} />
            </td>
            <td className={styles.taskTitle}>{props.task.Title}</td>
            <td>{DateTime.fromISO(props.task.Time).toLocaleString(DateTime.TIME_24_SIMPLE)}</td>
        </tr>
    );
};

export const TaskSection: React.FC<ITaskSectionProps> = (props) => {
    const sources = props.section.sources;
    const [loading, setLoading] = React.useState(true);
    const taskLogServices = React.useMemo<SourceService[]>(
        () => createServices(sources, (s) => s.type === 'logs', selectLogs),
        [props.section]
    );
    const taskServices = React.useMemo<SourceService[]>(
        () => createServices(sources, (s) => s.type === 'tasks', selectTasks),
        [props.section]
    );
    const [taskLogs, setTaskLogs] = React.useState<ITaskLogItem[]>([]);
    const [tasks, setTasks] = React.useState<ITaskItem[]>([]);

    /**
     * Associative map from task.id to the tasklogs
     * corresponding to this task
     */
    const taskLogsMap = React.useMemo(() => {
        const map = new Map<number, ITaskLogItem[]>();
        taskLogs.forEach((log) => {
            if (!map.has(log.TaskId)) {
                map.set(log.TaskId, []);
            }
            map.get(log.TaskId).push(log);
        });
        return map;
    }, [taskLogs]);

    const fetchData = async (): Promise<void> => {
        try {
            const logs = taskLogServices.map(async (service) => service.getSourceData<ITaskLogItem>());
            const tasks = taskServices.map(async (service) => service.getSourceData<ITaskItem>());
            setTaskLogs(flatten(await Promise.all(logs)));
            setTasks(flatten(await Promise.all(tasks)).sort(taskSorter));
        } finally {
            setLoading(false);
        }
    };

    /** Fetch Data */
    React.useEffect(() => {
        const configValid = checkSourceTypes(props.section, ['logs', 'tasks']);
        if (configValid) {
            fetchData().catch((err) => console.error(err));
        } else {
            setTaskLogs([]);
            setTasks([]);
        }
    }, [props.section]);

    /** Listen events */
    React.useEffect(() => {
        const listenHandlerRemove = listenSectionEvent(props.section.name, 'REFRESH', async () => {
            setLoading(true);
            await clearCache([...taskLogServices, ...taskServices]);
            await fetchData();
        });
        return () => {
            listenHandlerRemove();
        };
    }, [props.section]);

    const dailyTasks = React.useMemo(() => tasks.filter((t) => t.Type === 'Daily'), [tasks]);

    const weeklyTasks = React.useMemo(
        () =>
            tasks
                .filter((t) => t.Type === 'Weekly')
                .reduce<{ [day: string]: ITaskItem[] }>((prev, task) => {
                    task.WeeklyDays.forEach((day: string) => {
                        if (!(day in prev)) {
                            prev[day] = [];
                        }
                        prev[day].push(task);
                    });
                    return prev;
                }, {}),
        [tasks]
    );
    const days = React.useMemo(
        () => Object.keys(weeklyTasks).sort((a, b) => daysMap[a] - daysMap[b]),
        [weeklyTasks]
    );

    const monthlyTasks = React.useMemo(
        () =>
            tasks
                .filter((t) => t.Type === 'Monthly')
                .reduce<{ [day: string]: ITaskItem[] }>((prev, task) => {
                    const label = getMonthDayLabel(task.MonthlyDay, 'working day');
                    if (!(label in prev)) {
                        prev[label] = [];
                    }
                    prev[label].push(task);
                    return prev;
                }, {}),
        [tasks]
    );
    const monthlyDays = React.useMemo(
        () => Object.keys(monthlyTasks).sort((a, b) => Number.parseInt(a) - Number.parseInt(b)),
        [monthlyTasks]
    );

    if (tasks.length === 0) {
        return <NoData />;
    }
    if (loading) {
        return <LoadingSpinner />
    }

    const renderParts = [];
    /** Daily */
    if (dailyTasks.length > 0) {
        renderParts.push(
            <ExpandHeader header={<Text variant="mediumPlus">Daily</Text>}>
                {dailyTasks.map((task) => (
                    <Task
                        key={task.Id}
                        task={task}
                        taskLog={findTaskLog(task, taskLogsMap.get(task.Id))}
                    />
                ))}
            </ExpandHeader>
        );
    }
    /** Weekly */
    if (days.length > 0) {
        renderParts.push(
            <ExpandHeader header={<Text variant="mediumPlus">Weekly</Text>}>
                {days.map((day) => (
                    <div key={day} className={styles.weeklyDay}>
                        <Text variant="mediumPlus" className={styles.weeklyLabel}>
                            {day}
                        </Text>
                        <div>
                            {weeklyTasks[day].map((task) => (
                                <Task
                                    key={task.Id + day}
                                    task={task}
                                    weekylDay={day}
                                    taskLog={findTaskLog(task, taskLogsMap.get(task.Id), day)}
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </ExpandHeader>
        );
    }
    /** Monthly */
    if (monthlyDays.length > 0) {
        renderParts.push(
            <ExpandHeader header={<Text variant="mediumPlus">Monthly</Text>}>
                {monthlyDays.map((day) => (
                    <div key={day} className={styles.weeklyDay}>
                        <Text variant="mediumPlus" className={styles.weeklyLabel}>
                            {day}
                        </Text>
                        <div>
                            {monthlyTasks[day].map((task) => (
                                <Task
                                    key={task.Id + day}
                                    task={task}
                                    taskLog={findTaskLog(task, taskLogsMap.get(task.Id))}
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </ExpandHeader>
        );
    }

    return (
        <div className={styles.container}>
            <table>{renderParts.map((part) => part)}</table>
        </div>
    );
};
