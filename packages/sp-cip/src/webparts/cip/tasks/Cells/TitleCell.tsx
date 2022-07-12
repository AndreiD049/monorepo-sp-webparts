import { Icon, Text } from 'office-ui-fabric-react';
import * as React from 'react';
import { ICellRenderer } from './ICellRenderer';
import styles from './Cells.module.scss';
import useParentStroke from '../../components/ParentStroke';
import { TaskNode } from '../graph/TaskNode';
import { nodeToggleOpen, taskUpdated } from '../../utils/dom-events';
import { useNavigate } from 'react-router';
import { useTasks } from '../useTasks';
import { isFinished } from '../task-utils';
import { loadingStart, loadingStop } from '../../components/Utils/LoadingAnimation';

interface ICheckExpandButtonProps
    extends React.HTMLAttributes<HTMLButtonElement> {
    node: TaskNode;
}

const CheckExpandButton: React.FC<ICheckExpandButtonProps> = (props) => {
    const button = React.useRef(null);
    const item = props.node.getTask();

    let classNames = React.useMemo(() => {
        let result = styles['round-button'];
        if (!item.Subtasks) {
            result += ` ${
                isFinished(item)
                    ? styles['round-finished-button']
                    : styles['round-open-button']
            }`;
        }
        return result;
    }, [props.node]);

    const content = React.useMemo(() => {
        if (item.Subtasks) {
            return <span>{item.Subtasks}</span>;
        } else {
            return (
                <Icon
                    iconName={`${isFinished(item) ? 'Cancel' : 'CheckMark'}`}
                    className={styles['round-button__icon']}
                />
            );
        }
    }, [props.node]);

    return (
        <div style={{ position: 'relative' }}>
            <button
                disabled={props.node.Display === 'disabled'}
                ref={button}
                id={`task-${item.Id}`}
                data-taskid={item.Id}
                onClick={props.onClick}
                onDoubleClick={(evt) => evt.stopPropagation()}
                className={classNames}
            >
                {content}
            </button>
            {useParentStroke(props.node)}
        </div>
    );
};

export const TitleCell: ICellRenderer = (node, nestLevel) => {
    const navigate = useNavigate();
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
    }

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
                    if (node.getTask().Subtasks === 0) {
                        loadingStart();
                        if (!isFinished(node.getTask())) {
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
                style={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'pre',
                }}
            >
                {node.getTask().Title}
            </Text>
        </div>
    );
};

