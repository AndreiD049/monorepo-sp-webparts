import { IDetailsRowProps } from '@fluentui/react';
import * as React from 'react';
import styles from './Task.module.scss';
import { TaskNode } from './graph/TaskNode';
import { nodeToggleOpenHandler, relinkParent, subtasksAddedHandler, subtasksDeletedHandler, subtasksUpdatedHandler } from '../utils/dom-events';
import SubtasksProxy from './SubtasksProxy';
import { RenderCell } from './cells/render-cells';
import { TaskNodeContext } from './TaskNodeContext';
import { isFinished } from '@service/sp-cip';
import MainService from '../services/main-service';
import { uniqBy } from '@microsoft/sp-lodash-subset';

export interface ITaskProps extends React.HTMLAttributes<HTMLDivElement> {
    rowProps: IDetailsRowProps;
    node: TaskNode;
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
    const [subtasks, setSubtasks] = React.useState<TaskNode[]>([]);

    const subtasksNode = React.useMemo(() => {
        return (
            <SubtasksProxy 
				rowProps={props.rowProps} 
				node={props.node}
				subtasks={subtasks}
				onTaskRender={(child) => (
                        <Task
                            key={child.Id}
                            node={child}
                            rowProps={props.rowProps}
                            style={props.style}
                        />
				)}
            />
        );
    }, [subtasks]);

    const cells = React.useMemo(() => {
        const result: { [key: string]: JSX.Element } = {};
        props.rowProps.columns.forEach((column) => {
            result[column.key] = (
                <RenderCell fieldName={column.fieldName} node={props.node} />
            );
        });
        return result;
    }, [props.node]);

    React.useEffect(() => {
		const removeHandlers: (() => void)[] = [];
		const nodeId = props.node.Id;
        const removeOpenHandler = nodeToggleOpenHandler(
			nodeId,
            async (isOpen) => {
                isOpen = isOpen ?? !open;
                setOpen(isOpen);
                if (!isOpen) return;

                // Check if subtasks are all loaded
                const task = props.node.getTask();
                const loadedChildren = props.node.getChildren();
                if (loadedChildren.length === task.Subtasks) {
					setSubtasks([...loadedChildren]);
					return;
				}

                // Load subtasks
                const fetched = await MainService.getTaskService().getSubtasks(
                    task
                );
				const subtaskNodes = fetched.map((s) => new TaskNode(s));
				props.node.withChildren(subtaskNodes);
                setSubtasks(subtaskNodes);
            }
        );
		removeHandlers.push(removeOpenHandler);

		const removeSubtaskAdded = subtasksAddedHandler(props.node.Id, (task) => {
			const newNode = new TaskNode(task).withParent(props.node);
			
			setSubtasks((prev) => uniqBy([...prev, newNode], (n) => n.Id));
		});
		removeHandlers.push(removeSubtaskAdded);

		if (open) {
			const removeSubtaskUpdated = subtasksUpdatedHandler(props.node.Id, (task) => {
				const newNode = new TaskNode(task).withParent(props.node);
				setSubtasks((prev) => {
					return prev.map((n) => n.Id === newNode.Id ? newNode : n);
				});
			});
			removeHandlers.push(removeSubtaskUpdated);

			const removeTaskDeleted = subtasksDeletedHandler(props.node.Id, (taskId) => {
				setSubtasks((prev) => prev.filter((n) => n.Id !== taskId));
			});
			removeHandlers.push(removeTaskDeleted);
		}
        return () => removeHandlers.forEach((r) => r());
    }, [subtasks, open]);

    /**
     * Relink parents when node is open/closed
     */
    React.useEffect(() => {
        let next = props.node;
        while (next.getParent()) {
            relinkParent(next.getNextSibling()?.Id);
            next = next.getParent();
        }
    }, [props.node, open]);

    return (
        <TaskNodeContext.Provider
            value={{
                open,
                node: props.node,
                isTaskFinished: isFinished(props.node.getTask()),
            }}
        >
            <div className={styles.task} style={{ ...props.style }}>
                {props.rowProps.columns.map((column) => {
                    return (
                        <div
                            key={column.fieldName}
                            className={styles.task__cell}
                            style={{
                                width: column.calculatedWidth,
                            }}
                        >
                            {cells[column.key]}
                        </div>
                    );
                })}
            </div>
            {open && subtasksNode}
        </TaskNodeContext.Provider>
    );
};

export default Task;
