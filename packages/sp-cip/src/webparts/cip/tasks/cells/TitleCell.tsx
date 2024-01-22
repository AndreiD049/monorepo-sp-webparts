import { isFinished } from '@service/sp-cip';
import {
    DefaultButton,
    Icon,
    IconButton,
    PrimaryButton,
    Stack,
    Text,
} from '@fluentui/react';
import * as React from 'react';
import { useNavigate } from 'react-router';
import { hideDialog, showDialog } from 'sp-components';
import useParentStroke from '../../components/ParentStroke';
import Pill from '../../components/pill/Pill';
import {
    loadingStart,
    loadingStop,
} from '../../components/utils/LoadingAnimation';
import MainService from '../../services/main-service';
import { DIALOG_ID } from '../../utils/constants';
import { nodeSetOpen, relinkParent, taskUpdated } from '../../utils/dom-events';
import { GlobalContext } from '../../utils/GlobalContext';
import { finishTask } from '../../utils/task';
import { TaskNode } from '../graph/TaskNode';
import { TaskNodeContext } from '../TaskNodeContext';
import styles from './Cells.module.scss';

interface ICheckExpandButtonProps
    extends React.HTMLAttributes<HTMLButtonElement> {
    node: TaskNode;
}

const SliceCircle: React.FC<{ completed: number; total: number }> = ({
    completed,
    total,
}) => {
    const { theme } = React.useContext(GlobalContext);
    const radius = 47;
    const circumference = 2 * Math.PI * radius;
    const progress = completed / total;
    const strokeDashoffset = circumference * (1 - progress);

    return (
        <svg viewBox="0 0 100 100" height="100%">
            <circle
                cx="50"
                cy="50"
                r={radius}
                fill="none"
                stroke="#ddd"
                strokeWidth="10"
                transform="rotate(-90 50 50)"
            />
            <circle
                cx="50"
                cy="50"
                r={radius}
                fill="none"
                stroke={theme.palette.themePrimary}
                strokeWidth="10"
                strokeDasharray={`${circumference} ${circumference}`}
                strokeDashoffset={strokeDashoffset}
                transform="rotate(-90 50 50)"
            />
            <text
                x="50"
                y="50"
                textAnchor="middle"
                dominantBaseline="central"
                fontWeight="bold"
                fontSize="2em"
            >
                {`${completed}/${total}`}
            </text>
        </svg>
    );
};

const CheckExpandButton: React.FC<ICheckExpandButtonProps> = (props) => {
    const { open, node, isTaskFinished } = React.useContext(TaskNodeContext);
    const button = React.useRef(null);
    const item = node.getTask();
    const parentStroke = useParentStroke(node);

    const isButtonDisabled = React.useMemo(() => {
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
            return (
                <SliceCircle
                    completed={item.FinishedSubtasks}
                    total={item.Subtasks}
                />
            );
        } else {
            return (
                <Icon iconName={`${isTaskFinished ? 'Cancel' : 'CheckMark'}`} />
            );
        }
    }, [node]);

    const expandButton = React.useMemo(() => {
        if (item.Subtasks > 0) {
            return (
                <IconButton
                    onClick={() => {
						nodeSetOpen(item.Id);
					}}
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
				data-type="task-button"
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
        const handleFinish = async (): Promise<void> => {
            hideDialog(DIALOG_ID);
            loadingStart();
            const newItem = await finishTask(node.getTask(), currentUser.Id);
            if (newItem) {
                taskUpdated(newItem);
				relinkParent('all');
                if (newItem.ParentId) {
                    taskUpdated(await taskService.getTask(newItem.ParentId));
                }
            }
        };

        return new Promise((resolve, reject) => {
            try {
                showDialog({
                    id: DIALOG_ID,
                    dialogProps: {
                        title: 'Finish task',
                        subText: 'Task will become Finished. Are you sure?',
                        isBlocking: true,
                    },
                    footer: (
                        <Stack
                            horizontal
                            horizontalAlign="end"
                            tokens={{ childrenGap: 5 }}
                        >
                            <PrimaryButton
                                onClick={async () => {
                                    await handleFinish();
                                    resolve();
                                }}
                            >
                                Yes
                            </PrimaryButton>
                            <DefaultButton
                                onClick={() => {
                                    hideDialog(DIALOG_ID);
                                    resolve();
                                }}
                            >
                                No
                            </DefaultButton>
                        </Stack>
                    ),
                });
            } catch (err: unknown) {
                reject(err);
            }
        });
    };

    const handleReopenTask = async (node: TaskNode): Promise<void> => {
        const handleReopen = async (): Promise<void> => {
            hideDialog(DIALOG_ID);
            loadingStart();
            await taskService.reopenTask(node.Id);
            const newItem = await taskService.getTask(node.Id);
            taskUpdated(newItem);
			relinkParent('all');
            if (newItem.ParentId) {
                taskUpdated(await taskService.getTask(newItem.ParentId));
            }
        };

        return new Promise((resolve, reject) => {
            try {
                showDialog({
                    id: DIALOG_ID,
                    dialogProps: {
                        title: 'Finish task',
                        subText: 'Are you sure to re-open this task?',
                        isBlocking: true,
                    },
                    footer: (
                        <Stack
                            horizontal
                            horizontalAlign="end"
                            tokens={{ childrenGap: 5 }}
                        >
                            <PrimaryButton
                                onClick={async () => {
                                    await handleReopen();
                                    resolve();
                                }}
                            >
                                Yes
                            </PrimaryButton>
                            <DefaultButton
                                onClick={() => {
                                    hideDialog(DIALOG_ID);
                                    resolve();
                                }}
                            >
                                No
                            </DefaultButton>
                        </Stack>
                    ),
                });
            } catch (err: unknown) {
                reject(err);
            }
        });
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
				console.log(node.getDescendantsAndSelf());
                navigate(`task/${node.Id}`, { state: { node } });
                // Empty the selection is text was selected while double clicking
                document.getSelection().empty();
            }}
        >
            <CheckExpandButton
                node={node}
                onClick={async () => {
                    if (item.Subtasks === item.FinishedSubtasks) {
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
            {node.isOrphan && (
                <Pill value="Subtask" style={{ minWidth: '75px' }} />
            )}
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
