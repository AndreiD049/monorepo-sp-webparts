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
import { LoadingSpinner, Task } from 'sp-components';
import styles from './TaskSection.module.scss';
import { IDropdownOption, Text } from '@fluentui/react';
import { IndexedDbCache } from 'indexeddb-manual-cache';
import { listenSectionEvent } from '../../components/Section/section-events';
import { NoData } from '../../components/NoData';
import { uniqBy } from '@microsoft/sp-lodash-subset';

export interface ITaskSectionProps extends ISectionProps {
    // Props go here
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
            setTaskLogs(uniqBy([...logs, ...created], (tl) => tl.ID));
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
        return taskLogs.map((t) => (
            <Task
                key={t.ID}
                info={{
                    date: new Date().toLocaleDateString(),
                    description: t.Description,
                    status: t.Status,
                    time: new Date(t.Time).toLocaleTimeString(),
                    title: t.Title,
                    user: t.User,
                    remark: t.Remark,
                    category: t.Task.Category,
                }}
                canEditOthers={false}
                currentUserId={currentUser.Id}
                expired={false}
                isHovering={false}
                onChange={handleTaskChange(t)}
                theme={HomepageWebPart.theme}
                style={{
                    minWidth: '150px',
                    maxWidth: '90%',
                }}
            />
        ));
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
