import * as React from 'react';
import { ISectionProps } from '../../components/Section';
import {
    TaskService,
    selectTasks,
    checkTasksAndCreateTaskLogs,
    TaskLogsService,
    ensureFutureTaskLogs,
} from '@service/sp-tasks';
import HomepageWebPart from '../../HomepageWebPart';
import { GlobalContext } from '../../context/GlobalContext';
import ITaskLog, { TaskStatus } from '@service/sp-tasks/dist/models/ITaskLog';
import { LoadingSpinner, Task, TaskGroup } from 'sp-components';
import styles from './TaskSection.module.scss';
import { IDropdownOption, Text } from '@fluentui/react';
import { IndexedDbCache } from 'indexeddb-manual-cache';
import { listenSectionEvent } from '../../components/Section/section-events';
import { NoData } from '../../components/NoData';
import { uniqBy } from '@microsoft/sp-lodash-subset';
import { DateTime } from 'luxon';

export interface ITaskSectionProps extends ISectionProps {
    // Props go here
}

// Grouped tasks
export interface ITaskGroup {
    name: string;
    startIndex: number;
    tasks: ITaskLog[];
}

export function getGroupedTasks(tasks: ITaskLog[]): ITaskGroup[] {
    const result: ITaskGroup[] = []

    let groupIndex = 0
    for (let i = 0; i < tasks.length; i++) {
        const taskLog = tasks[i]
        const category = taskLog.Task.Category
        
        const currentGroup = result[groupIndex]
        if (!currentGroup) {
            result[groupIndex] = {
                name: category,
                startIndex: i,
                tasks: [taskLog],
            }
        } else if (currentGroup.name === category) {
            result[groupIndex] = {
                ...currentGroup,
                tasks: [...currentGroup.tasks, taskLog],
            }
        } else {
            groupIndex += 1
            result[groupIndex] = {
                name: category,
                startIndex: i,
                tasks: [taskLog],
            }            
        }
    }

    return result;
}

const MINUTE = 1000 * 60;

export const TaskSection: React.FC<ITaskSectionProps> = (props) => {
    const { selectedUser, currentUser } = React.useContext(GlobalContext);
    const sources = props.section.sources;
    const [reload, setReload] = React.useState<boolean>(false);
    // Tasks
    const taskSource = React.useMemo(() => sources.find((s) => s.type === 'tasks'), [sources]);
    const taskService = React.useMemo(
        () =>
            new TaskService({
                sp: HomepageWebPart.spBuilder.getSP(taskSource.rootUrl),
                listName: taskSource.listName,
            }),
        [taskSource]
    );
    const tasksDb = React.useMemo(
        () =>
            new IndexedDbCache('Homepage_Cache', location.host + location.pathname, {
                expiresIn: MINUTE * taskSource.ttlMinutes,
            }),
        [taskSource]
    );
    const taskCache = React.useMemo(
        () => ({
            getTasks: (userId: number) => tasksDb.key(`taskSection/getTasks/user/${userId}`),
        }),
        [tasksDb]
    );
    // Task Logs
    const logSource = React.useMemo(() => sources.find((s) => s.type === 'logs'), [sources]);
    const logService = React.useMemo(
        () =>
            new TaskLogsService({
                sp: HomepageWebPart.spBuilder.getSP(logSource.rootUrl),
                listName: logSource.listName,
            }),
        [logSource]
    );

    const [loading, setLoading] = React.useState(true);
    const [taskLogs, setTaskLogs] = React.useState<ITaskLog[]>([]);

    // Fetch data
    React.useEffect(() => {
        async function run(): Promise<void> {
            setLoading(true);
            if (!selectedUser) return;
            const tasks = await taskCache
                .getTasks(selectedUser.Id)
                .get(() => taskService.getTasksByUserId(selectedUser.Id, new Date()));
            const date = new Date();
            const logs = await logService.getTaskLogsByUserId(date, selectedUser.Id);
            const futureLogs = await logService.getFutureTaskLogsByUserId(date, selectedUser.Id);
            await ensureFutureTaskLogs(tasks, futureLogs, logService);
            const selected = selectTasks(tasks, new Date());
            const created = await checkTasksAndCreateTaskLogs(
                selected,
                logs,
                new Date(),
                logService
            );
            const taskLogs = uniqBy([...logs, ...created], (tl) => tl.ID)
            // Sort on time
            taskLogs.sort((a, b) => {
                const dtA = DateTime.fromISO(a.Time).toISOTime();
                const dtB = DateTime.fromISO(a.Time).toISOTime();
                return dtA < dtB ? -1 : 1;
            });
            // Sort on category
            taskLogs.sort((a, b) => {
                const catA = a.Task.Category;
                const catB = b.Task.Category;
                if (!catA && !catB) return 0
                if (!catA) return 1
                if (!catB) return -1
                if (catA === catB) return 0
                const countA = taskLogs.filter((t) => t.Task.Category === catA).length
                const countB = taskLogs.filter((t) => t.Task.Category === catB).length
                return countA < countB ? 1 : -1
            })
            setTaskLogs(taskLogs);
            setLoading(false);
        }
        run().catch((e) => console.error(e));
    }, [selectedUser, reload]);

    // Listen events
    React.useEffect(() => {
        const listenHandlerRemove = listenSectionEvent(props.section.name, 'REFRESH', async () => {
            setLoading(true);
            await taskCache.getTasks(selectedUser.Id).remove();
            setReload((prev) => !prev);
        });
        return () => {
            listenHandlerRemove();
        };
    }, [props.section, selectedUser]);

    const handleTaskChange = React.useCallback(
        (t: ITaskLog) => async (_ev: {}, option: IDropdownOption) => {
            try {
                if (t.Status === option.key.toString()) return;
                setLoading(true);
                const status = option.key.toString() as TaskStatus;
                const payload: Partial<ITaskLog> = {
                    Status: status,
                };
                // Make sure finished and cancelled tasks don't show up next days
                if (status === 'Finished' || status === 'Cancelled') {
                    payload.Completed = true;
                } else {
                    payload.Completed = !t.Transferable;
                }
                const newLog = await logService.updateTaskLog(t.ID, payload);
                setTaskLogs((prev) => prev.map((t) => (t.ID === newLog.ID ? newLog : t)));
            } finally {
                setLoading(false);
            }
        },
        []
    );

    const tasks = React.useMemo(() => {
        if (taskLogs.length === 0) return <NoData />;
        const grouped = getGroupedTasks(taskLogs);
        const body: JSX.Element[] = [];
        for (let i = 0; i < grouped.length; i++) {
            const group = grouped[i];
            if (group.name === null || group.tasks.length === 1) {
                group.tasks.forEach((task) => {
                    body.push(
                        <Task
                            key={task.ID}
                            info={{
                                date: new Date().toLocaleDateString(),
                                description: task.Description,
                                status: task.Status,
                                time: new Date(task.Time).toLocaleTimeString(),
                                title: task.Title,
                                user: task.User,
                                remark: task.Remark,
                                category: task.Task.Category,
                            }}
                            canEditOthers={false}
                            currentUserId={currentUser.Id}
                            expired={false}
                            isHovering={false}
                            onChange={handleTaskChange(task)}
                            theme={HomepageWebPart.theme}
                            style={{
                                minWidth: '150px',
                                maxWidth: '90%',
                            }}
                        />
                    )
                })
            } else {
                const statusMap = group.tasks.reduce<{ [status: string]: number }>((prev, cur) => {
                    const status: string = cur.Status;
                    if (prev[status] === undefined) {
                        prev[status] = 0;
                    }
                    prev[status] += 1;
                    return prev;
                }, {});
                body.push(
                        <TaskGroup
                            key={group.name}
                            groupName={group.name}
                            statusMap={statusMap}
                            style={{
                                width: '330px',
                                maxWidth: '90%',
                                minWidth: 150,
                                padding: 10,
                            }}
                        >
                            <div style={{
                                display: 'flex',
                                flexFlow: 'column nowrap',
                                alignItems: 'center',
                                gap: '0.5em',
                            }}>
                                {group.tasks.map((task) => (
                                    <Task
                                        key={task.ID}
                                        info={{
                                            date: new Date().toLocaleDateString(),
                                            description: task.Description,
                                            status: task.Status,
                                            time: new Date(task.Time).toLocaleTimeString(),
                                            title: task.Title,
                                            user: task.User,
                                            remark: task.Remark,
                                            category: task.Task.Category,
                                        }}
                                        canEditOthers={false}
                                        currentUserId={currentUser.Id}
                                        expired={false}
                                        isHovering={false}
                                        onChange={handleTaskChange(task)}
                                        theme={HomepageWebPart.theme}
                                        style={{
                                            minWidth: '150px',
                                            maxWidth: '90%',
                                        }}
                                    />
                                ))}
                            </div>
                        </TaskGroup>
                );            
            }
            
        } 
        return body;
    }, [taskLogs]);

    return (
        <>
            <div className={styles.container}>
                <Text variant="large">{new Date().toLocaleDateString()}</Text>
                {tasks}
            </div>
            {loading && <LoadingSpinner />}
        </>
    );
};
