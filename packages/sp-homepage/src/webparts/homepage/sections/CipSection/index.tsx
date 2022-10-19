import * as React from 'react';
import { ISectionProps } from '../../components/Section';
import styles from './CipSection.module.scss';
import { IndexedDbCache } from 'indexeddb-manual-cache';
import ISource from '../../models/ISource';
import { TaskService } from '@service/sp-cip';
import HomepageWebPart from '../../HomepageWebPart';
import { ITaskOverview } from '@service/sp-cip/dist/models/ITaskOverview';
import { GlobalContext } from '../../context/GlobalContext';
import { flatten } from '@microsoft/sp-lodash-subset';
import { TitleCell, ActionsCell } from 'sp-components';
import { MINUTE } from '../../constants';
import { IColumn, DetailsList } from 'office-ui-fabric-react';
import { ISiteUserInfo } from 'sp-preset';

export interface ICipSectionProps extends ISectionProps {
    // Props go here
}

export interface ITaskOverviewWithSource extends ITaskOverview {
    source: ISource;
}

const createCipService = (
    source: ISource
): {
    getOpenTasks: (userId: number) => Promise<ITaskOverviewWithSource[]>;
    getUser: (loginName: string) => Promise<ISiteUserInfo>;
} => {
    const db = new IndexedDbCache('Homepage_Cache', location.host + location.pathname, {
        expiresIn: source.ttlMinutes * MINUTE,
    });
    const sp = HomepageWebPart.spBuilder.getSP(source.rootUrl);
    const taskService = new TaskService({
        sp,
        listName: source.listName,
    });
    return {
        getOpenTasks: async (userId: number) => {
            return db.getCached(`cipTasks/${userId}`, async () => {
                const tasks: ITaskOverview[] = await taskService.getUserTasks(userId, 'Open');
                return tasks.map((task) => ({ ...task, source }));
            });
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
        return sources.map((s) => createCipService(s));
    }, [sources]);
    const [tasks, setTasks] = React.useState<ITaskOverviewWithSource[]>([]);
    const testRef = React.useRef(null);

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
                services.map(async (s) => {
                    const user = await s.getUser(selectedUser.LoginName);
                    return user ? s.getOpenTasks(user.Id) : []; 
                })
            );
            const result: ITaskOverviewWithSource[] = flatten(tasks);
            setTasks(result);
        }
        run().catch((err) => console.error(err));
    }, [selectedUser]);

    const columns: IColumn[] = React.useMemo(() => {
        return [
            {
                key: 'Title',
                name: 'Title',
                minWidth: 200,
                isResizable: true,
            },
            {
                key: 'Actions',
                name: '',
                minWidth: 100,
                isResizable: true,
            },
        ];
    }, []);
    return (
        <div ref={testRef} className={styles.container}>
            <DetailsList
                items={tasks}
                columns={columns}
                onRenderRow={(props) => {
                    const item: ITaskOverviewWithSource = props.item;

                    return (
                        <div
                            style={{
                                display: 'flex',
                                flexFlow: 'row nowrap',
                                padding: '.5em 0',
                            }}
                        >
                            <TitleCell
                                style={{
                                    marginLeft: 48,
                                    padding: '0 8px 0 12px',
                                    width: props.columns[0].currentWidth,
                                }}
                                taskId={item.Id}
                                title={item.Title}
                                comments={item.CommentsCount}
                                attachments={item.AttachmentsCount}
                                totalSubtasks={item.Subtasks}
                                finishedSubtasks={item.FinishedSubtasks}
                            />
                            <ActionsCell
                                style={{
                                    padding: '0 8px 0 12px',
                                    width: props.columns[1].currentWidth,
                                }}
                                items={[
                                    {
                                        name: 'navigate',
                                        onClick: () => console.log('new'),
                                    },
                                ]}
                                overflowItems={[]}
                            />
                        </div>
                    );
                }}
            />
        </div>
    );
};
