import { IconButton } from 'office-ui-fabric-react';
import * as React from 'react';
import { ICellRenderer } from './ICellRenderer';
import styles from './Cells.module.scss';
import { PANEL_OPEN_EVT } from '../../utils/constants';
import { CREATE_PANEL_ID } from '../../components/useCipPanels';
import { TaskContext } from '../TaskContext';

const ActionsCell: ICellRenderer = (props) => {
    const handleCreateSubtask = React.useCallback((id) => () => {
        document.dispatchEvent(
            new CustomEvent(PANEL_OPEN_EVT, {
                detail: {
                    id: CREATE_PANEL_ID,
                    open: true,
                    props: {
                        parentId: id,
                    },
                },
            })
        );
    }, []);

    return (
        <TaskContext.Consumer>
            {(ctx) => (
                <div className={styles['action-buttons-container']}>
                    <IconButton
                        className={
                            styles['action-buttons-container__action-button']
                        }
                        iconProps={{ iconName: 'Add' }}
                        title="Add subtask"
                        onClick={handleCreateSubtask(ctx.task.Id)}
                    />
                    <IconButton
                        className={
                            styles['action-buttons-container__action-button']
                        }
                        iconProps={{ iconName: 'CommentAdd' }}
                        title="Add comment"
                    />
                    <IconButton
                        className={
                            styles['action-buttons-container__action-button']
                        }
                        iconProps={{ iconName: 'Edit' }}
                        title="Edit task"
                    />
                </div>
            )}
        </TaskContext.Consumer>
    );
};

export default ActionsCell;
