import * as React from 'react';
import HomepageWebPart from '../../HomepageWebPart';
import ISource from '../../models/ISource';
import styles from './CipSection.module.scss';
import { CipTask } from '../../components/CipTask';
import { GlobalContext } from '../../context/GlobalContext';
import { IColumn, DetailsList, SelectionMode, DetailsListLayoutMode } from 'office-ui-fabric-react';
import { IFieldInfo, ISiteUserInfo } from 'sp-preset';
import { ISectionProps } from '../../components/Section';
import { ITaskOverview } from '@service/sp-cip/dist/models/ITaskOverview';
import { IndexedDbCache } from 'indexeddb-manual-cache';
import { MINUTE, HOUR } from '../../constants';
import { TaskService, createTaskTree } from '@service/sp-cip';
import { flatten } from '@microsoft/sp-lodash-subset';
import { useGroups } from '../../components/CipTask/useGroups';
import { CipSectionContext } from './CipSectionContext';
import { NoData } from '../../components/NoData';

export interface ICipSectionProps extends ISectionProps {
    // Props go here
}

export interface ICipService {
    source: ISource;
    getOpenTasks: (userId: number) => Promise<ITaskOverview[]>;
    getSubtasks: (task: ITaskOverview) => Promise<ITaskOverview[]>;
    getUser: (loginName: string) => Promise<ISiteUserInfo>;
    getStatusChoice: () => Promise<IFieldInfo>;
    getPriorityChoice: () => Promise<IFieldInfo>;
}

// Task details with information on it's original source
export interface ITaskOverviewWithSource extends ITaskOverview {
    service: ICipService;
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

    return {
        source,
        getOpenTasks: async (userId: number) => {
            const tasks = await db.getCached(`cipTasks/${userId}`, async () => {
                const tasks: ITaskOverview[] = await taskService.getUserTasks(userId, 'Open');
                return tasks;
            });
            return tasks;
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
    };
};

export const CipSection: React.FC<ICipSectionProps> = (props) => {
    const { selectedUser } = React.useContext(GlobalContext);
    const sources = props.section.sources;
    const services = React.useMemo(() => {
        return sources.map((s) => createServiceWrapper(s));
    }, [sources]);
    const [tasks, setTasks] = React.useState<ITaskOverviewWithSource[][]>([]);
    const [status, setStatus] = React.useState<string[]>([]);
    const [priority, setPriority] = React.useState<string[]>([]);

    // Fetch field choices
    React.useEffect(() => {
        async function run(): Promise<void> {
            const service = services[0];
            const status = await service.getStatusChoice();
            setStatus(status.Choices || []);
            const priority = await service.getPriorityChoice();
            setPriority(priority.Choices || []);
        }
        run().catch((err) => console.error(err));
    }, [services]);

    /**
     * Get tasks for each source provided
     * WARNING: each site has separate site users.
     * This means that responsible Id can be different for each source.
     * This is why we get current user for each source separately.
     * It is cached, so there should be not much additional load on the application.
     */
    React.useEffect(() => {
        async function run(): Promise<void> {
            if (!selectedUser) return null;
            const tasks = await Promise.all(
                // Find the open tasks for each service
                services.map(async (s) => {
                    // Get current source user
                    const user = await s.getUser(selectedUser.LoginName);

                    // If user was found, return his open tasks
                    if (user) {
                        return (await s.getOpenTasks(user.Id)).map((t) => ({ ...t, service: s }));
                    } else {
                        return [];
                    }
                })
            );
            setTasks(tasks);
        }
        run().catch((err) => console.error(err));
    }, [selectedUser]);

    const treeRoots = React.useMemo(() => {
        return tasks.map((t) => createTaskTree(t));
    }, [tasks]);

    const children = React.useMemo(() => {
        return flatten(treeRoots.map((root) => root.getChildren())).sort((a, b) =>
            a.Category < b.Category ? -1 : 1
        );
    }, [treeRoots]);

    const { groups } = useGroups(children, (c) => c.Category);

    const columns: IColumn[] = React.useMemo(() => {
        return [
            {
                key: 'Title',
                name: 'Title',
                minWidth: 300,
                isResizable: true,
            },
            {
                key: 'Actions',
                name: 'Actions',
                minWidth: 100,
                isResizable: false,
            },
            {
                key: 'Status',
                name: 'Status',
                minWidth: 100,
                isResizable: false,
            },
            {
                key: 'Priority',
                name: 'Priority',
                minWidth: 100,
                isResizable: false,
            },
            {
                key: 'DueDate',
                name: 'DueDate',
                minWidth: 100,
                isResizable: true,
            },
        ];
    }, []);

    if (children.length === 0) {
        return <NoData />
    }

    return (
        <CipSectionContext.Provider
            value={{
                statusChoices: status,
                priorityChoices: priority,
            }}
        >
            <div className={styles.container}>
                <DetailsList
                    groups={groups}
                    items={children}
                    getKey={(item) =>
                        `${item.getTask().service.source.rootUrl}/${item.getTask().Id}`
                    }
                    columns={columns}
                    selectionMode={SelectionMode.none}
                    onRenderRow={(props) => {
                        return <CipTask rowProps={props} />;
                    }}
                    layoutMode={DetailsListLayoutMode.fixedColumns}
                />
            </div>
        </CipSectionContext.Provider>
    );
};
