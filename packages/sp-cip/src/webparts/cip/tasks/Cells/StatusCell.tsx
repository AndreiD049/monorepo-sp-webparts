import * as React from 'react';
import Pill from '../../components/Pill/Pill';
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
    const choices = React.useMemo(() => {
        if (!fieldInfo?.Choices) return [];
        return fieldInfo.Choices.filter((choise) => choise !== node.getTask().Status);
    }, [fieldInfo]);

    const handleClick = React.useCallback((status: string) => async () => {
        await updateTask(node.Id, {
            Status: status
        });
        taskUpdated(await getTask(node.Id));
        calloutVisibility({ visible: false });
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
