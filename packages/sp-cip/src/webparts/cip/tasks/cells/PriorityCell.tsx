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

const PriorityCellCallout: React.FC<IPriorityCellProps> = (props) => {
    const { currentUser } = React.useContext(GlobalContext);
    const task = React.useMemo(() => props.node.getTask(), []);
    const taskService = MainService.getTaskService();
    const actionService = MainService.getActionService();
    const priority = useChoiceFields('Priority');

    const handleClick = React.useCallback(
        (prio: 'None' | 'Low' | 'Medium' | 'High') => async () => {
            loadingStart();
            calloutVisibility({ visible: false });
            await taskService.updateTask(task.Id, {
                Priority: prio,
            });
            const newTask = await taskService.getTask(task.Id);
            taskUpdated(newTask);
            await actionService.addAction(
                task.Id,
                'Priority',
                `${task.Priority}|${newTask.Priority}`,
                currentUser.Id,
                new Date().toISOString()
            );
            loadingStop();
        },
        [task]
    );

    const choices = React.useMemo(() => {
        if (!priority.fieldInfo) return null;
        return priority.fieldInfo.Choices.map((field) => {
            const taskDisabled =
                task.Priority.toLowerCase() === field.toLowerCase();
            return (
                <Pill
                    key={field}
                    onClick={!taskDisabled && handleClick(field as 'None' | 'Low' | 'Medium' | 'High')}
                    style={{
                        height: '100%',
                        width: '100%',
                        borderRadius: '5px',
                    }}
                    value={field}
                    disabled={taskDisabled}
                />
            );
        });
    }, [task, priority]);

    return (
        <div className={`${styles.callout} ${styles.priority}`}>{choices}</div>
    );
};

type IPriorityCellProps = {
    node: TaskNode;
};

const PriorityCell: React.FC<IPriorityCellProps> = (props) => {
    const { isTaskFinished } = React.useContext(TaskNodeContext);
    const task = props.node.getTask();
    const elemRef = React.useRef(null);

    const handleClick = React.useCallback(() => {
        calloutVisibility({
            target: elemRef,
            visible: true,
            RenderComponent: PriorityCellCallout,
            componentProps: props,
        });
    }, [props.node, elemRef]);

    return (
        <div ref={elemRef} onClick={handleClick}>
            <Pill
                style={{
                    height: '100%',
                    width: '100%',
                    borderRadius: '5px',
                }}
                value={task.Priority}
                disabled={isTaskFinished}
            />
        </div>
    );
};

export default PriorityCell;
