import { IDetailsRowProps } from 'office-ui-fabric-react';
import * as React from 'react';
import { ITaskOverview } from './ITaskOverview';
import styles from './Task.module.scss';
import { useTasks } from './useTasks';
import { TaskNode } from './graph/TaskNode';
import { renderCell } from './Cells/render-cells';
import {
    nodeToggleOpenHandler,
} from '../utils/dom-events';
import SubtasksProxy from './SubtasksProxy';
export interface ITaskProps {
    rowProps: IDetailsRowProps;
    node: TaskNode;
    setTasks: React.Dispatch<React.SetStateAction<ITaskOverview[]>>;
}

/**
 * How to render a task.
 * Task is rendered from the columns provided from outside (from a DetailsList)
 * Each cell is rendered according to a Render Map (see above)
 * If a task has children, it can render additional nested tasks
 * * Additional tasks are lazily loaded, showing a Shimmer while
 * * subtasks are loading (https://developer.microsoft.com/en-us/fluentui#/controls/web/shimmer)
 */
const Task: React.FC<ITaskProps> = (props) => {
    const [open, setOpen] = React.useState<boolean>(false);
    const { getTask } = useTasks();

    const subtasksNode = React.useMemo(() => {
        if (!open) return null;
        return (
            <SubtasksProxy
                rowProps={props.rowProps}
                node={props.node}
                onLoad={(tasks) => {
                    const task = props.node.getTask();
                    // Only reset if node is a proxy
                    if (props.node.getType() === 'proxy') {
                        props.setTasks((prev) => {
                            const filtered = prev.filter(
                                (t) => t.ParentId !== task.Id
                            );
                            console.log(filtered, prev);
                            return [...filtered, ...tasks];
                        });
                    }
                }}
            >
                <div>
                    {props.node.getChildren().map((child) => (
                        <Task
                            node={child}
                            rowProps={props.rowProps}
                            setTasks={props.setTasks}
                        />
                    ))}
                </div>
            </SubtasksProxy>
        );
    }, [open, props.rowProps.columns, props.node]);

    React.useEffect(() => {
        const removeOpenHandler = nodeToggleOpenHandler(props.node.Id, () =>
            setOpen((prev) => !prev)
        );
        return () => {
            removeOpenHandler();
        };
    }, []);

    return (
        <>
            <div className={styles.task}>
                {props.rowProps.columns.map((column) => {
                    return (
                        <div
                            className={styles.task__cell}
                            style={{
                                width: column.calculatedWidth,
                            }}
                        >
                            {renderCell(column.fieldName, props.node)}
                        </div>
                    );
                })}
            </div>
            {subtasksNode}
        </>
    );
};

export default Task;
