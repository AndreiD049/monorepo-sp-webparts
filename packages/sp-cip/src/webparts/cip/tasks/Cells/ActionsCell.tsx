import {
    IconButton,
} from 'office-ui-fabric-react';
import * as React from 'react';
import { ICellRenderer } from './ICellRenderer';
import styles from './Cells.module.scss';
import { getAlert } from '../../components/AlertDialog';
import { useNavigate } from 'react-router';

const ActionsCell: ICellRenderer = (node) => {
    const navigate = useNavigate();

    const handleCreateSubtask = React.useCallback(
        (id) => () => {  navigate(`new/${id}`); },
        []
    );

    return (
        <div className={styles['action-buttons-container']}>
            <IconButton
                className={styles['action-buttons-container__action-button']}
                iconProps={{ iconName: 'Add' }}
                title="Add subtask"
                disabled={node.Display === 'disabled'}
                onClick={handleCreateSubtask(node.Id)}
            />
            <IconButton
                className={styles['action-buttons-container__action-button']}
                iconProps={{ iconName: 'CommentAdd' }}
                title="Add comment"
                disabled={node.Display === 'disabled'}
                onClick={() =>
                    getAlert({
                        alertId: "MAIN",
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
                disabled={node.Display === 'disabled'}
                onClick={() => {
                    navigate(`task/${node.Id}`, { state: {editable: true} });
                }}
            />
            <IconButton
                className={styles['action-buttons-container__action-button']}
                iconProps={{ iconName: 'Clock' }}
                title="Log time"
                disabled={node.Display === 'disabled'}
                onClick={() =>
                    getAlert({
                        alertId: "MAIN",
                        title: 'Work in progress',
                        subText: 'Work in progress',
                        buttons: [{ key: 'ok', text: 'Ok' }],
                    })
                }
            />
            <IconButton
                title="More options"
                disabled={node.Display === 'disabled'}
                menuIconProps={{ iconName: 'MoreVertical' }}
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
                                    alertId: "MAIN",
                                    title: 'Work in progress',
                                    subText: 'Work in progress',
                                    buttons: [{ key: 'ok', text: 'Ok' }],
                                })
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
                                    alertId: "MAIN",
                                    title: 'Work in progress',
                                    subText: 'Work in progress',
                                    buttons: [{ key: 'ok', text: 'Ok' }],
                                })
                            },
                        },
                    ],
                }}
            />
        </div>
    );
};

export default ActionsCell;
