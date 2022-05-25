import { ButtonType, DialogType, IconButton } from 'office-ui-fabric-react';
import * as React from 'react';
import { ICellRenderer } from './ICellRenderer';
import styles from './Cells.module.scss';
import { CREATE_PANEL_ID, DETAILS_PANEL_ID } from '../../components/useCipPanels';
import { openPanel } from '../../utils/dom-events';
import { getAlert } from '../../components/AlertDialog';

const ActionsCell: ICellRenderer = (node) => {
    const handleCreateSubtask = React.useCallback(
        (id) => () => openPanel(CREATE_PANEL_ID, true, { parentId: id }),
        []
    );

    return (
        <div className={styles['action-buttons-container']}>
            <IconButton
                className={styles['action-buttons-container__action-button']}
                iconProps={{ iconName: 'Add' }}
                title="Add subtask"
                onClick={handleCreateSubtask(node.Id)}
            />
            <IconButton
                className={styles['action-buttons-container__action-button']}
                iconProps={{ iconName: 'CommentAdd' }}
                title="Add comment"
                onClick={() => getAlert({
                    title: 'Work in progress',
                    subText: 'Work in progress',
                    buttons: [{ key: 'ok', text: 'Ok' }]
                })}
            />
            <IconButton
                className={styles['action-buttons-container__action-button']}
                iconProps={{ iconName: 'Edit' }}
                title="Edit task"
                onClick={() => {
                    openPanel(DETAILS_PANEL_ID, true, { node: node, editable: true });
                }}

            />
            <IconButton
                className={styles['action-buttons-container__action-button']}
                iconProps={{ iconName: 'Clock' }}
                title="Log time"
                onClick={() => getAlert({
                    title: 'Work in progress',
                    subText: 'Work in progress',
                    buttons: [{ key: 'ok', text: 'Ok' }]
                })}
            />
        </div>
    );
};

export default ActionsCell;
