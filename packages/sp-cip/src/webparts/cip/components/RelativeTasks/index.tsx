import { ITaskOverview } from '@service/sp-cip/dist/models/ITaskOverview';
import { Icon, Label, Link } from 'office-ui-fabric-react';
import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import MainService from '../../services/main-service';
import { nodeSetOpen } from '../../utils/dom-events';
import styles from './RelativeTasks.module.scss';

export interface IRelativeTasksProps {
    task: ITaskOverview | null;
    onDismiss: () => void;
}

interface IRelatives {
    parent: ITaskOverview;
    children: ITaskOverview[];
}

export const RelativeTasks: React.FC<IRelativeTasksProps> = (props) => {
    const taskService = MainService.getTaskService();
    const [relatives, setRelatives] = React.useState<IRelatives>({
        parent: null,
        children: [],
    });
    const navigate = useNavigate();

    React.useEffect(() => {
        async function run() {
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

    const handleNavigate = (url: string) => {
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
                        {relatives.parent.Title}
                    </Link>
                ) : (
                    <Link disabled>-</Link>
                )}
            </span>
            {relatives.children?.length > 0 && (
                <span>
                    {relatives.children.map((c) => (
                        <span key={c.Id} className={styles.subtask}>
                            <Icon title="Subtask" iconName="Childof" />
                            <Link
                                onClick={() => {
                                    nodeSetOpen(props.task.Id, true);
                                    handleNavigate(`/task/${c.Id}`);
                                }}
                            >
                                {c.Title}
                            </Link>
                        </span>
                    ))}
                </span>
            )}
        </div>
    );
};