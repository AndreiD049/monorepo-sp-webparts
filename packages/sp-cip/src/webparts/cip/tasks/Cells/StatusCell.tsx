import * as React from 'react';
import { useActions } from '../../comments/useActions';
import Pill from '../../components/pill/Pill';
import { loadingStart, loadingStop } from '../../components/utils/LoadingAnimation';
import { calloutVisibility, taskUpdated } from '../../utils/dom-events';
import { useChoiceFields } from '../../utils/useChoiceFields';
import { TaskNode } from '../graph/TaskNode';
import { TaskNodeContext } from '../TaskNodeContext';
import { useTasks } from '../useTasks';
import styles from './Cells.module.scss';

export interface IStatusCellProps {
    node: TaskNode;
}

export const StatusCellCallout: React.FC<IStatusCellProps> = ({ node }) => {
    const { fieldInfo } = useChoiceFields('Status');
    const { updateTask, getTask } = useTasks();
    const { addAction } = useActions();
    const choices = React.useMemo(() => {
        if (!fieldInfo?.Choices) return [];
        return fieldInfo.Choices.filter((choise) => choise !== node.getTask().Status);
    }, [fieldInfo]);

    const handleClick = React.useCallback((status: string) => async () => {
        calloutVisibility({ visible: false });
        loadingStart();
        await updateTask(node.Id, {
            Status: status
        });
        const newTask = await getTask(node.Id);
        await addAction(node.Id, 'Status', `${node.getTask().Status}|${newTask.Status}`);
        taskUpdated(newTask);
        loadingStop();
    }, [node]);

    return (<div className={`${styles.callout} ${styles['center-content']}`}>
            {choices.map((choice) => <Pill onClick={handleClick(choice)} value={choice} />)}
    </div>);
};

export const StatusCell: React.FC<IStatusCellProps> = (props) => {
    const { isTaskFinished } = React.useContext(TaskNodeContext);
    const handleClick = React.useCallback((evt) => {
        calloutVisibility({
            target: evt.nativeEvent,
            visible: true,
            RenderComponent: StatusCellCallout,
            componentProps: props,
        });
    }, [props.node]);

    return (
        <Pill
            id={`task-status-pill-${props.node.Id}`}
            onClick={handleClick}
            value={props.node.getTask()?.Status}
            disabled={props.node.Display === 'disabled' || isTaskFinished}
        />
    );
};
