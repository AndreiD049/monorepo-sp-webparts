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
import { TitleCell } from 'sp-components';

export interface ICipSectionProps extends ISectionProps {
    // Props go here
}

const db = new IndexedDbCache('Homepage_Cache', location.host + location.pathname, {
    expiresIn: 1000 * 60,
});
const createCipService = (
    source: ISource
): {
    getOpenTasks: (userId: number) => Promise<ITaskOverview[]>;
} => {
    const taskService = new TaskService({
        sp: HomepageWebPart.spBuilder.getSP(source.rootUrl),
        listName: source.listName,
    });
    return {
        getOpenTasks: async (userId: number) => {
            return db.getCached(`cipTasks/${userId}`, () =>
                taskService.getUserTasks(userId, 'Open')
            );
        },
    };
};

export const CipSection: React.FC<ICipSectionProps> = (props) => {
    const { selectedUser } = React.useContext(GlobalContext);
    const sources = props.section.sources;
    const services = React.useMemo(() => {
        return sources.map((s) => createCipService(s));
    }, [sources]);
    const [tasks, setTasks] = React.useState<ITaskOverview[]>([]);
    const testRef = React.useRef(null);

    React.useEffect(() => {
        async function run(): Promise<void> {
            if (!selectedUser) return null;
            const tasks = await Promise.all(services.map((s) => s.getOpenTasks(selectedUser.Id)));
            const result = flatten(tasks);
            setTasks(result);
        }
        run().catch((err) => console.error(err));
    }, [services, selectedUser]);

    return (
        <div ref={testRef} className={styles.container}>
            {tasks.map((task) => (
                <TitleCell
                    key={task.Id}
                    comments={task.CommentsCount}
                    attachments={task.AttachmentsCount}
                    finishedSubtasks={task.FinishedSubtasks}
                    totalSubtasks={task.Subtasks}
                    taskId={task.Id}
                    title={task.Title}
                />
            ))}
        </div>
    );
};
