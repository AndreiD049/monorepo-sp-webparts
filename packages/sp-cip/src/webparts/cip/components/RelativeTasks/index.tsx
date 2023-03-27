import { isFinished } from '@service/sp-cip';
import { ITaskOverview } from '@service/sp-cip/dist/models/ITaskOverview';
import { Icon, Label, Link, PersonaSize } from 'office-ui-fabric-react';
import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import MainService from '../../services/main-service';
import { formatProgress } from '../../tasks/cells/ProgressCell';
import { nodeSetOpen } from '../../utils/dom-events';
import { SimplePersona } from '../SimplePersona';
import styles from './RelativeTasks.module.scss';

export interface IRelativeTasksProps {
    task: ITaskOverview | undefined;
    onDismiss: () => void;
}

interface IRelatives {
    parent: ITaskOverview;
    children: ITaskOverview[];
}

const TaskLine: React.FC<{ task: ITaskOverview }> = (props) => {
    const isTaskFinished = isFinished(props.task);

    return (
        <div className={styles.taskLine}>
            <Icon iconName={isTaskFinished ? 'CompletedSolid' : 'CircleRing'} />
            <SimplePersona
                task={props.task}
                size={PersonaSize.size8}
                personaProps={{ styles: { details: { paddingRight: 0 } } }}
            />
            <span>&quot;{props.task.Title}&quot;</span>
            <span>({formatProgress(props.task.Progress)})</span>
        </div>
    );
};

export const RelativeTasks: React.FC<IRelativeTasksProps> = (props) => {
    const taskService = MainService.getTaskService();
    const [relatives, setRelatives] = React.useState<IRelatives>({
        parent: null,
        children: [],
    });
    const navigate = useNavigate();

    React.useEffect(() => {
        async function run(): Promise<void> {
            let parent = null;
            if (props.task.ParentId) {
                parent = await taskService.getTask(props.task.ParentId);
            }
            const children = await taskService.getSubtasks(props.task);
            setRelatives({
                parent,
                children,
            });
        }
        run().catch((e) => console.error(e));
    }, [props.task]);

    if (!props.task) return null;
    if (!relatives.parent && relatives.children.length === 0) return null;

    const label = (relatives.parent || relatives.children.length > 0) && (
        <Label>Relatives:</Label>
    );

    const handleNavigate = (url: string): void => {
        props.onDismiss();
        setTimeout(() => navigate(url), 200);
    };

    return (
        <div className={styles.container}>
            {label}
            <span className={styles.parent}>
                <Icon title="Parent task" iconName="ChevronUpMed" />
                {relatives.parent ? (
                    <Link
                        onClick={() => {
                            handleNavigate(`/task/${relatives.parent.Id}`);
                        }}
                    >
                        <TaskLine task={relatives.parent} />
                    </Link>
                ) : (
                    <Link disabled>-</Link>
                )}
            </span>
            {relatives.children?.length > 0 && (
                <span>
                    {relatives.children
                        .sort((a, b) => (a.Id > b.Id ? 1 : -1))
                        .map((c) => (
                            <span key={c.Id} className={styles.subtask}>
                                <Icon title="Subtask" iconName="Childof" />
                                <Link
                                    onClick={() => {
                                        nodeSetOpen(props.task.Id, true);
                                        handleNavigate(`/task/${c.Id}`);
                                    }}
                                >
                                    <TaskLine task={c} />
                                </Link>
                            </span>
                        ))}
                </span>
            )}
        </div>
    );
};
