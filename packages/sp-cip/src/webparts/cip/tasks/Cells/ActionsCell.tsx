import { IconButton } from 'office-ui-fabric-react';
import * as React from 'react';
import { ICellRenderer } from './ICellRenderer';
import { getAlert } from '../../components/AlertDialog';
import { useNavigate } from 'react-router';
import { TaskNodeContext } from '../TaskNodeContext';
import styles from './Cells.module.scss';

const ActionsCell: ICellRenderer = (node) => {
    const { isTaskFinished } = React.useContext(TaskNodeContext);
    const navigate = useNavigate();
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
                    getAlert({
                        alertId: 'MAIN',
                        title: 'Work in progress',
                        subText: 'Work in progress',
                        buttons: [{ key: 'ok', text: 'Ok' }],
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
                    getAlert({
                        alertId: 'MAIN',
                        title: 'Work in progress',
                        subText: 'Work in progress',
                        buttons: [{ key: 'ok', text: 'Ok' }],
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
                            onClick: () => {
                                getAlert({
                                    alertId: 'MAIN',
                                    title: 'Work in progress',
                                    subText: 'Work in progress',
                                    buttons: [{ key: 'ok', text: 'Ok' }],
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
                                getAlert({
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
