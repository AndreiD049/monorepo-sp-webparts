import { IconButton } from 'office-ui-fabric-react';
import * as React from 'react';
import { ICellRenderer } from './ICellRenderer';
import styles from './Cells.module.scss';

const ActionsCell: ICellRenderer = (props) => {
    return (
        <div className={styles['action-buttons-container']}>
            <IconButton
                className={styles['action-buttons-container__action-button']}
                iconProps={{ iconName: 'Add' }}
                title="Add subtask"
            />
            <IconButton
                className={styles['action-buttons-container__action-button']}
                iconProps={{ iconName: 'CommentAdd' }}
                title="Add comment"
            />
            <IconButton
                className={styles['action-buttons-container__action-button']}
                iconProps={{ iconName: 'Edit' }}
                title="Edit task"
            />
        </div>
    );
};

export default ActionsCell;
