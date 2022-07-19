import { ButtonType, IconButton } from 'office-ui-fabric-react';
import * as React from 'react';
import { ICellRenderer } from './ICellRenderer';
import { getDialog } from '../../components/AlertDialog';
import { useNavigate } from 'react-router';
import { TaskNodeContext } from '../TaskNodeContext';
import styles from './Cells.module.scss';
import { loadingStart, loadingStop } from '../../components/Utils/LoadingAnimation';
import { useTasks } from '../useTasks';
import { taskDeleted } from '../../utils/dom-events';
import { AddCommentDialog } from '../Dialogs/AddCommentDialog';
import { LogTime } from '../Dialogs/LogTime';
import { TaskNode } from '../graph/TaskNode';

const ActionsCell: React.FC<{node: TaskNode}> = ({node}) => {
    const { isTaskFinished } = React.useContext(TaskNodeContext);
    const navigate = useNavigate();
    const { deleteTaskAndSubtasks } = useTasks();
    const isDisabled = React.useMemo(() => {
        if (node.Display === 'disabled') return true;
        if (node.getTask() && isTaskFinished) return true;
        return false;
    }, [node]);

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
            <IconButton
                className={styles['action-buttons-container__action-button']}
                iconProps={{ iconName: 'CommentAdd' }}
                title="Add comment"
                disabled={isDisabled}
                onClick={() =>
                    getDialog({
                        alertId: 'MAIN',
                        title: 'Add comment',
                        Component: (<AddCommentDialog task={node.getTask()} />)
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
                iconProps={{ iconName: 'Clock' }}
                title="Log time"
                disabled={isDisabled}
                onClick={() =>
                    getDialog({
                        alertId: 'MAIN',
                        title: 'Log time',
                        Component: (<LogTime task={node.getTask()} dialogId="MAIN" />),
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
                                const confirm = await getDialog({
                                    alertId: 'MAIN',
                                    title: 'Delete tasks',
                                    subText: 'All subtasks will be deleted as well. Are you sure',
                                    buttons: [{ key: 'yes', text: 'Yes' }, { key: 'no', text: 'No', type: ButtonType.default }],
                                });
                                loadingStart('default');
                                if (confirm === 'yes') {
                                    await deleteTaskAndSubtasks(node.getTask())
                                    taskDeleted(node.Id);
                                }
                                loadingStop('default');
                            },
                        },
                        {
                            key: 'move',
                            text: 'Move',
                            iconProps: {
                                iconName: 'SIPMove',
                            },
                            onClick: () => {
                                getDialog({
                                    alertId: 'MAIN',
                                    title: 'Work in progress',
                                    subText: 'Work in progress',
                                    buttons: [{ key: 'ok', text: 'Ok' }],
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
