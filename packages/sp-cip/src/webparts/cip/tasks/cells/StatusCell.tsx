import * as React from 'react';
import Pill from '../../components/pill/Pill';
import {
    loadingStart,
    loadingStop,
} from '../../components/utils/LoadingAnimation';
import { calloutVisibility, taskUpdated } from '../../utils/dom-events';
import { useChoiceFields } from '../../utils/useChoiceFields';
import { TaskNode } from '../graph/TaskNode';
import { TaskNodeContext } from '../TaskNodeContext';
import styles from './Cells.module.scss';
import MainService from '../../services/main-service';
import { GlobalContext } from '../../utils/GlobalContext';
import { finishTask } from '../../utils/task';

export interface IStatusCellProps {
    node: TaskNode;
}

export const StatusCellCallout: React.FC<IStatusCellProps> = ({ node }) => {
    const { currentUser } = React.useContext(GlobalContext);
    const { fieldInfo } = useChoiceFields('Status');
    const taskService = MainService.getTaskService();
    const actionService = MainService.getActionService();
    const choices = React.useMemo(() => {
        if (!fieldInfo?.Choices) return [];
        return fieldInfo.Choices.filter(
            (choise) => choise !== node.getTask().Status
        );
    }, [fieldInfo]);

    const handleClick = React.useCallback(
        (status: string) => async () => {
            try {
                calloutVisibility({ visible: false });

                loadingStart();
                if (status === 'Finished' || status === 'Cancelled') {
                    const newTask = await finishTask(
                        node.getTask(),
                        currentUser.Id,
                        status
                    );
                    taskUpdated(newTask);
                    if (newTask.ParentId) {
                        taskUpdated(
                            await taskService.getTask(newTask.ParentId)
                        );
                    }
                } else {
                    await taskService.updateTask(node.Id, {
                        Status: status,
                    });
                    const newTask = await taskService.getTask(node.Id);
                    await actionService.addAction(
                        node.Id,
                        'Status',
                        `${node.getTask().Status}|${newTask.Status}`,
                        currentUser.Id,
                        new Date().toISOString()
                    );
                    taskUpdated(newTask);
                }
            } finally {
                loadingStop();
            }
        },
        [node]
    );

    return (
        <div className={`${styles.callout} ${styles['center-content']}`}>
            {choices.map((choice) => (
                <Pill
                    key={choice}
                    onClick={handleClick(choice)}
                    value={choice}
                    style={{ lineHeight: '12px' }}
                />
            ))}
        </div>
    );
};

export const StatusCell: React.FC<IStatusCellProps> = (props) => {
    const { isTaskFinished } = React.useContext(TaskNodeContext);
    const handleClick = React.useCallback(
        (evt) => {
            calloutVisibility({
                target: evt.nativeEvent,
                visible: true,
                RenderComponent: StatusCellCallout,
                componentProps: props,
            });
        },
        [props.node]
    );

    return (
        <Pill
            id={`task-status-pill-${props.node.Id}`}
            onClick={handleClick}
            value={props.node.getTask()?.Status}
            style={{ lineHeight: '12px' }}
            disabled={props.node.Display === 'disabled' || isTaskFinished}
        />
    );
};
