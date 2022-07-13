import { Icon, IconButton, Text } from 'office-ui-fabric-react';
import * as React from 'react';
import { ICellRenderer } from './ICellRenderer';
import useParentStroke from '../../components/ParentStroke';
import { TaskNode } from '../graph/TaskNode';
import { nodeToggleOpen, taskUpdated } from '../../utils/dom-events';
import { useNavigate } from 'react-router';
import { useTasks } from '../useTasks';
import {
    loadingStart,
    loadingStop,
} from '../../components/Utils/LoadingAnimation';
import styles from './Cells.module.scss';
import { TaskNodeContext } from '../TaskNodeContext';
import { ITaskOverview } from '../ITaskOverview';
import { isFinished } from '../task-utils';

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

    let classNames = React.useMemo(() => {
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
                    className={styles['round-button__icon']}
                />
            );
        }
    }, [node]);

    const expandButton = React.useMemo(() => {
        if (item.Subtasks > 0) {
            return (
                <IconButton
                    onClick={() => nodeToggleOpen(item.Id)}
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

export const TitleCell: ICellRenderer = (node, nestLevel) => {
    const { isTaskFinished } = React.useContext(TaskNodeContext);
    const navigate = useNavigate();
    const item = node.getTask();
    const { finishTask, getTask, reopenTask } = useTasks();

    const handleFinishTask = async (node: TaskNode) => {
        await finishTask(node.Id);
        const newItem = await getTask(node.Id);
        taskUpdated(newItem);
        if (newItem.ParentId) {
            taskUpdated(await getTask(newItem.ParentId));
        }
    };

    const handleReopenTask = async (node: TaskNode) => {
        await reopenTask(node.Id);
        const newItem = await getTask(node.Id);
        taskUpdated(newItem);
        if (newItem.ParentId) {
            taskUpdated(await getTask(newItem.ParentId));
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
                        nodeToggleOpen(node.Id);
                    }
                }}
            />
            <Text
                variant="medium"
                block
                className={`${styles['title__text']} ${
                    isTaskFinished ? styles['title__text_finished'] : ''
                }`}
            >
                {item.Title}
            </Text>
        </div>
    );
};
