import { ActionService, TaskService } from '@service/sp-cip';
import { ITaskOverview } from '@service/sp-cip/dist/models/ITaskOverview';
import { IndexedDbCache } from 'indexeddb-manual-cache';
import * as React from 'react';
import { IFieldInfo, ISiteUserInfo } from 'sp-preset';
import { ITaskOverviewWithSource } from '.';
import { convertTask } from '../../components/CipTask/utils';
import { hideSpinner, showSpinner } from '../../components/LoadingSpinner';
import { listenSectionEvent } from '../../components/Section/section-events';
import { CIP_SPINNER_ID, HOUR, MINUTE, TASK_UPDATED_EVT } from '../../constants';
import HomepageWebPart from '../../HomepageWebPart';
import ISource from '../../models/ISource';
import IUser from '../../models/IUser';
import { getSourceKey } from '../../utils';

export interface ICipService {
    source: ISource;
    db: IndexedDbCache;
    taskService: TaskService;
    actionService: ActionService | undefined;
    getOpenTasks: (userId: number) => Promise<ITaskOverview[]>;
    updateOpenTasksCache: (userId: number, task: ITaskOverview) => Promise<void>;
    clearOpenTasksCache: (userId: number) => Promise<void>;
    getSubtasks: (task: ITaskOverview) => Promise<ITaskOverview[]>;
    getStatusChoice: () => Promise<IFieldInfo>;
    getPriorityChoice: () => Promise<IFieldInfo>;
    getUser: (loginName: string) => Promise<ISiteUserInfo>;
    getSiteUsers: () => Promise<ISiteUserInfo[]>;
}

const createServiceWrapper = (source: ISource): ICipService => {
    const db = new IndexedDbCache('Homepage_Cache', location.host + location.pathname, {
        expiresIn: source.ttlMinutes * MINUTE,
    });
    const sp = HomepageWebPart.spBuilder.getSP(source.rootUrl);
    const taskService = new TaskService({
        sp,
        listName: source.listName,
    });
    const actionsSource = source.additionalSources?.find((s) => s.type === 'actions');
    const actionService = actionsSource ? new ActionService({
        sp,
        listName: actionsSource.listName,
        taskListName: source.listName,
    }) : null;

    return {
        source,
        db,
        taskService,
        actionService,
        getOpenTasks: async (userId: number) => {
            const tasks = await db.getCached(
                `cipTasks/${getSourceKey(source)}/${userId}`,
                async () => {
                    const tasks: ITaskOverview[] = await taskService.getUserTasks(userId, 'Open');
                    return tasks;
                }
            );
            return tasks;
        },
        updateOpenTasksCache: async (userId: number, task: ITaskOverview) => {
            await db.updateCached(
                `cipTasks/${getSourceKey(source)}/${userId}`,
                (prev: ITaskOverview[]) => {
                    if (task.FinishDate) {
                        return prev.filter((t) => t.Id !== task.Id);
                    }
                    return prev.map((t) => (t.Id === task.Id ? task : t));
                }
            );
        },
        clearOpenTasksCache: async (userId: number) => {
            await db.invalidateCached(`cipTasks/${getSourceKey(source)}/${userId}`);
        },
        getSubtasks: async (task: ITaskOverview) => {
            return taskService.getSubtasks(task);
        },
        getStatusChoice: async () => {
            return db.getCached(
                `cipStatusChoice`,
                async () => {
                    return sp.web.lists.getByTitle(source.listName).fields.getByTitle('Status')();
                },
                HOUR * 24
            );
        },
        getPriorityChoice: async () => {
            return db.getCached(
                `cipPriorityChoice`,
                async () => {
                    return sp.web.lists.getByTitle(source.listName).fields.getByTitle('Priority')();
                },
                HOUR * 24
            );
        },
        getUser: async (loginName: string) =>
            db.getCached(`cipCurrentUser/${source.rootUrl}/${loginName}`, async () => {
                try {
                    const user = await sp.web.siteUsers.getByLoginName(loginName)();
                    return user;
                } catch {
                    return null;
                }
        }),
        getSiteUsers: async () => {
            return db.getCached(`siteUsers/${getSourceKey(source)}`, async () => {
                return sp.web.siteUsers();
            }, HOUR)
        }
    };
};

interface ITaskUpdatedEvent {
    tasks: ITaskOverviewWithSource[];
}

interface ITaskDict {
    services: { [key: string]: ICipService };
    tasks: { [sourceKey: string]: ITaskOverviewWithSource[] };
    loaded: boolean;
}

export function tasksUpdated(...tasks: ITaskOverviewWithSource[]): void {
    document.dispatchEvent(
        new CustomEvent<ITaskUpdatedEvent>(TASK_UPDATED_EVT, {
            detail: {
                tasks,
            },
        })
    );
}

export function useTasks(sources: ISource[], sectionName: string, selectedUser: IUser): ITaskDict {
    const services = React.useMemo(() => {
        const result: { [key: string]: ICipService } = {};
        sources.forEach((source) => {
            result[getSourceKey(source)] = createServiceWrapper(source);
        });
        return result;
    }, [selectedUser, sources]);
    const [loaded, setLoaded] = React.useState(false);
    const [tasks, setTasks] = React.useState<{ [sourceKey: string]: ITaskOverviewWithSource[] }>(
        {}
    );
    const [reload, setReload] = React.useState(false);

    // When user changes - cleanup task list
    React.useEffect(() => {
        setTasks({});
    }, [selectedUser]);

    // Fetch the tasks for each service
    React.useEffect(() => {
        async function run(): Promise<void> {
            setLoaded(false);
            const calls = Object.keys(services).map(async (key) => {
                const service = services[key];
                const user = await service.getUser(selectedUser.LoginName);
                if (user) {
                    const tasks = await service.getOpenTasks(user.Id);
                    setTasks((prev) => ({
                        ...prev,
                        [key]: tasks.map((t) => convertTask(t, service)),
                    }));
                } else {
                    setTasks((prev) => ({
                        ...prev,
                        [key]: [],
                    }));
                }
            });
            // Wait until all data is fetched;
            await Promise.all(calls);
            setLoaded(true);
            // Hide the spinner if it's running
            hideSpinner(CIP_SPINNER_ID);
        }
        if (selectedUser) {
            run().catch((err) => console.error(err));
        }
    }, [reload, selectedUser]);

    // Listen section events
    React.useEffect(() => {
        const listenHandlerRemove = listenSectionEvent(sectionName, 'REFRESH', async () => {
            try {
                showSpinner(CIP_SPINNER_ID);
                for (const key in services) {
                    if (Object.prototype.hasOwnProperty.call(services, key)) {
                        const service = services[key];
                        await service.clearOpenTasksCache(selectedUser.Id);
                    }
                }
            } finally {
                setReload((prev) => !prev);
            }
        });
        return () => {
            listenHandlerRemove();
        };
    }, [selectedUser]);

    // Fetch data
    React.useEffect(() => {
        function handler(evt: CustomEvent<ITaskUpdatedEvent>): void {
            const tasks = evt.detail.tasks;
            tasks.forEach(async (task) => {
                const service = task.service;
                const source = service.source;
                const key = getSourceKey(source);
                // Update cache
                const taskOverview = { ...task };
                delete taskOverview.service;
                await task.service.updateOpenTasksCache(task.Responsible.Id, taskOverview);
                // Add the new task to the list
                setTasks((prev) => {
                    let prevList = prev[key];
                    if (!prevList) {
                        prevList = [task];
                    } else if (prevList.find((t) => t.Id === task.Id)) {
                        prevList = prevList.map((t) => (t.Id === task.Id ? task : t));
                    } else {
                        prevList.push(task);
                    }
                    return {
                        ...prev,
                        [key]: prevList,
                    };
                });
            });
        }
        document.addEventListener(TASK_UPDATED_EVT, handler);
        return () => document.removeEventListener(TASK_UPDATED_EVT, handler);
    }, []);

    return {
        services,
        tasks,
        loaded,
    };
}
