import { Icon, IconButton, Text } from 'office-ui-fabric-react';
import * as React from 'react';
import { finishTask } from '../../utils/task';
import useParentStroke from '../../components/ParentStroke';
import { TaskNode } from '../graph/TaskNode';
import { nodeSetOpen, taskUpdated } from '../../utils/dom-events';
import { useNavigate } from 'react-router';
import {
    loadingStart,
    loadingStop,
} from '../../components/utils/LoadingAnimation';
import { TaskNodeContext } from '../TaskNodeContext';
import Pill from '../../components/pill/Pill';
import MainService from '../../services/main-service';
import { ITaskOverview } from '@service/sp-cip/dist/models/ITaskOverview';
import { isFinished } from '@service/sp-cip';
import { GlobalContext } from '../../utils/GlobalContext';
import styles from './Cells.module.scss';

interface ICheckExpandButtonProps
    extends React.HTMLAttributes<HTMLButtonElement> {
    node: TaskNode;
}

const SubtaskCounter: React.FC<{ item: ITaskOverview }> = ({ item }) => {
    return (
        <div className={styles['title__subtask-counter']}>
            <span>{item.FinishedSubtasks}</span>
            <span className={styles['title__subtask-delimiter']}>|</span>
            <span>{item.Subtasks}</span>
        </div>
    );
};

const CheckExpandButton: React.FC<ICheckExpandButtonProps> = (props) => {
    const { open, node, isTaskFinished } = React.useContext(TaskNodeContext);
    const button = React.useRef(null);
    const item = node.getTask();
    const parentStroke = useParentStroke(node);

    const isButtonDisabled = React.useMemo(() => {
        if (node.Display === 'disabled') return true;
        const parent = node.getParent();
        if (parent && parent.getTask()) {
            return isFinished(parent.getTask());
        }
        return false;
    }, [node]);

    const classNames: string = React.useMemo(() => {
        let result = styles['round-button'];
        if (!isButtonDisabled && item.Subtasks === item.FinishedSubtasks) {
            result += ` ${
                isTaskFinished
                    ? styles['round-finished-button']
                    : styles['round-open-button']
            }`;
        }
        return result;
    }, [node, isButtonDisabled]);

    const content = React.useMemo(() => {
        if (item.Subtasks > 0 && item.FinishedSubtasks !== item.Subtasks) {
            return <SubtaskCounter item={item} />;
        } else {
            return (
                <Icon
                    iconName={`${isTaskFinished ? 'Cancel' : 'CheckMark'}`}
                />
            );
        }
    }, [node]);

    const expandButton = React.useMemo(() => {
        if (item.Subtasks > 0) {
            return (
                <IconButton
                    onClick={() => nodeSetOpen(item.Id)}
                    iconProps={{
                        iconName: `${open ? 'ChevronDown' : 'ChevronRight'}`,
                    }}
                />
            );
        }
        return null;
    }, [open, node]);

    return (
        <div
            className={`${styles['title__front-buttons']} ${
                item.Subtasks > 0
                    ? ''
                    : styles['title__front-buttons_subtasks_none']
            }`}
            onDoubleClick={(evt) => evt.stopPropagation()}
        >
            <button
                disabled={isButtonDisabled}
                ref={button}
                id={`task-${item.Id}`}
                data-taskid={item.Id}
                onClick={props.onClick}
                className={classNames}
            >
                {content}
            </button>
            {expandButton}
            {parentStroke}
        </div>
    );
};

export const TitleCell: React.FC<{ node: TaskNode; nestLevel: number }> = ({
    node,
    nestLevel,
}) => {
    const { currentUser } = React.useContext(GlobalContext);
    const { isTaskFinished } = React.useContext(TaskNodeContext);
    const navigate = useNavigate();
    const item = node.getTask();
    const taskService = MainService.getTaskService();

    const handleFinishTask = async (node: TaskNode): Promise<void> => {
        const newItem = await finishTask(node.getTask(), currentUser.Id);
        if (newItem) {
            taskUpdated(newItem);
            if (newItem.ParentId) {
                taskUpdated(await taskService.getTask(newItem.ParentId));
            }
        }
    };

    const handleReopenTask = async (node: TaskNode): Promise<void> => {
        await taskService.reopenTask(node.Id);
        const newItem = await taskService.getTask(node.Id);
        taskUpdated(newItem);
        if (newItem.ParentId) {
            taskUpdated(await taskService.getTask(newItem.ParentId));
        }
    };

    return (
        <div
            data-type="row"
            style={{
                display: 'flex',
                flexFlow: 'row nowrap',
                alignItems: 'center',
                justifyContent: 'start',
                marginLeft: 30 * nestLevel,
            }}
            itemType="button"
            onDoubleClick={() => {
                navigate(`task/${node.Id}`, { state: { node } });
                // Empty the selection is text was selected while double clicking
                document.getSelection().empty();
            }}
        >
            <CheckExpandButton
                node={node}
                onClick={async () => {
                    if (item.Subtasks === item.FinishedSubtasks) {
                        loadingStart();
                        if (!isTaskFinished) {
                            await handleFinishTask(node);
                        } else {
                            await handleReopenTask(node);
                        }
                        loadingStop();
                    } else {
                        nodeSetOpen(node.Id);
                    }
                }}
            />
            {node.isOrphan && <Pill value="Subtask" />}
            <div className={styles['title-cell']}>
                <Text
                    variant="medium"
                    block
                    className={`${styles.title__text} ${
                        isTaskFinished ? styles.title__text_finished : ''
                    }`}
                    title={item.Title}
                >
                    {item.Title}
                </Text>
                <div className={styles['title-cell__count-icons']}>
                    <div>
                        <Icon iconName="Comment" /> {item.CommentsCount}
                    </div>
                    <div>
                        <Icon iconName="Attach" /> {item.AttachmentsCount}
                    </div>
                </div>
            </div>
        </div>
    );
};
