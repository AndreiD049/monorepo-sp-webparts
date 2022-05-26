import { useConst } from '@uifabric/react-hooks';
import * as React from 'react';
import Pill from '../../components/Pill/Pill';
import { calloutVisibility, taskUpdated } from '../../utils/dom-events';
import { useChoiceFields } from '../../utils/useChoiceFields';
import { TaskNode } from '../graph/TaskNode';
import { useTasks } from '../useTasks';
import styles from './Cells.module.scss';

const PriorityCellCallout: React.FC<IPriorityCellProps> = (props) => {
    const task = useConst(props.node.getTask());
    const { updateTask, getTask } = useTasks();
    const priority = useChoiceFields('Priority');

    const handleClick = React.useCallback(
        (prio: any) => async () => {
            await updateTask(task.Id, {
                Priority: prio,
            });
            const newTask = await getTask(task.Id);
            taskUpdated(newTask);
            calloutVisibility({ visible: false });
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
                    onClick={!taskDisabled && handleClick(field)}
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

    return <div className={`${styles.callout} ${styles.priority}`}>{choices}</div>;
};

type IPriorityCellProps = {
    node: TaskNode;
};

const PriorityCell: React.FC<IPriorityCellProps> = (props) => {
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
                disabled={props.node.Display === 'disabled'}
            />
        </div>
    );
};

export default PriorityCell;
