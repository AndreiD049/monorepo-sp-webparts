import { IconButton } from 'office-ui-fabric-react';
import * as React from 'react';
import { useNavigate } from 'react-router';
import { TaskNodeContext } from '../TaskNodeContext';
import styles from './Cells.module.scss';
import {
    loadingStart,
    loadingStop,
} from '../../components/utils/LoadingAnimation';
import { taskDeleted, addTimer, taskUpdated } from '../../utils/dom-events';
import { AddCommentDialog } from '../dialogs/AddCommentDialog';
import { TaskNode } from '../graph/TaskNode';
import MainService from '../../services/main-service';
import { FooterYesNo, hideDialog, showDialog } from 'sp-components';
import { DIALOG_ID } from '../../utils/constants';
import { MoveForm } from '../../components/MoveForm';
import { TimeLog } from '../../components/TimeLog';

const ActionsCell: React.FC<{ node: TaskNode }> = ({ node }) => {
    const { isTaskFinished } = React.useContext(TaskNodeContext);
    const navigate = useNavigate();
    const taskService = MainService.getTaskService();
    const isDisabled = React.useMemo(() => {
        if (node.getTask() && isTaskFinished) return true;
        return false;
    }, [node]);
    const parent = node.getParent();

    const handleCreateSubtask = React.useCallback(
        (id) => () => {
            navigate(`new/${id}`);
        },
        []
    );

    return (
        <div className={styles['action-buttons-container']}>
            <IconButton
                className={styles['action-buttons-container__action-button']}
                iconProps={{ iconName: 'Add' }}
                title="Add subtask"
                disabled={isDisabled}
                onClick={handleCreateSubtask(node.Id)}
            />
            {!parent.getTask() && (
                <IconButton
                    className={
                        styles['action-buttons-container__action-button']
                    }
                    iconProps={{ iconName: 'OneNoteLogo16' }}
                    title="Notes"
                    onClick={() => navigate(`/notes/${node.Id}`)}
                />
            )}
            <IconButton
                className={styles['action-buttons-container__action-button']}
                iconProps={{ iconName: 'CommentAdd' }}
                title="Add comment"
                disabled={isDisabled}
                onClick={() =>
                    showDialog({
                        id: DIALOG_ID,
                        dialogProps: { title: 'Add comment' },
                        content: (
                            <AddCommentDialog
                                task={node.getTask()}
                                onAfterComment={() => hideDialog(DIALOG_ID)}
                            />
                        ),
                    })
                }
            />
            <IconButton
                className={styles['action-buttons-container__action-button']}
                iconProps={{ iconName: 'Edit' }}
                title="Edit task"
                disabled={isDisabled}
                onClick={() => {
                    navigate(`task/${node.Id}`, { state: { editable: true } });
                }}
            />
            <IconButton
                className={styles['action-buttons-container__action-button']}
                iconProps={{ iconName: 'Play' }}
                title="Start timer"
                disabled={isDisabled}
                onClick={() => addTimer({ task: node.getTask() })}
            />
            <IconButton
                className={styles['action-buttons-container__action-button']}
                iconProps={{ iconName: 'Clock' }}
                title="Log time"
                disabled={isDisabled}
                onClick={() =>
                    showDialog({
                        id: DIALOG_ID,
                        dialogProps: { title: 'Log time' },
                        content: (
                            <TimeLog
                                task={node.getTask()}
                                dialogId={DIALOG_ID}
                            />
                        ),
                    })
                }
            />
            <IconButton
                title="More options"
                disabled={isDisabled}
                menuIconProps={{ iconName: 'MoreVertical' }}
                className={styles['action-buttons-container__action-button']}
                menuProps={{
                    items: [
                        {
                            key: 'delete',
                            text: 'Delete',
                            iconProps: {
                                iconName: 'Delete',
                            },
                            onClick: async () => {
                                showDialog({
                                    id: DIALOG_ID,
                                    dialogProps: {
                                        title: 'Delete tasks',
                                        subText:
                                            'All subtasks will be deleted as well. Are you sure',
                                    },
                                    footer: (
                                        <FooterYesNo
                                            onYes={async () => {
                                                hideDialog(DIALOG_ID);
                                                loadingStart('default');
                                                await taskService.deleteTaskAndSubtasks(
                                                    node.getTask()
                                                );

												// Check if parent exists
												const parent = node.getParent()?.getTask();
												if (parent) {
													// Update the number of subtasks
													const updatedParent = await taskService.recalculateSubtasks(parent.Id);
													taskUpdated(updatedParent);
												}
												taskDeleted(node.getTask());
                                                loadingStop('default');
                                            }}
                                            onNo={() => {
                                                hideDialog(DIALOG_ID);
                                            }}
                                        />
                                    ),
                                });
                            },
                        },
                        {
                            key: 'move',
                            text: 'Move',
                            iconProps: {
                                iconName: 'SIPMove',
                            },
                            onClick: () => {
                                showDialog({
                                    id: DIALOG_ID,
                                    dialogProps: {
                                        title: 'Move task',
                                    },
                                    content: (
                                        <MoveForm
                                            node={node}
                                            dialogId={DIALOG_ID}
                                        />
                                    ),
                                });
                            },
                        },
                    ],
                }}
            />
        </div>
    );
};

export default ActionsCell;
