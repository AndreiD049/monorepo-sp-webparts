import { IDetailsRowProps } from 'office-ui-fabric-react';
import * as React from 'react';
import styles from './Task.module.scss';
import { TaskNode } from './graph/TaskNode';
import { nodeToggleOpenHandler, relinkParent } from '../utils/dom-events';
import SubtasksProxy from './SubtasksProxy';
import { RenderCell } from './cells/render-cells';
import { TaskNodeContext } from './TaskNodeContext';
import { isFinished } from '@service/sp-cip';

function initialOpen(node: TaskNode, isFiltered: boolean): boolean {
    if (!isFiltered) return false;
    if (!node.hasChildren()) return false;
    if (node.getChildren().some((c) => c.isFilterApplicable)) return true;
    return node.getChildren().some((c) => initialOpen(c, isFiltered));
}

export interface ITaskProps extends React.HTMLAttributes<HTMLDivElement> {
    rowProps: IDetailsRowProps;
    node: TaskNode;
    isFiltered?: boolean;
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

    React.useEffect(() => {
        setOpen(initialOpen(props.node, props.isFiltered));
    }, [props.isFiltered]);

    const subtasksNode = React.useMemo(() => {
        if (!open) return null;
        if (props.node.Display === 'hidden') return null;
        return (
            <SubtasksProxy rowProps={props.rowProps} node={props.node}>
                <div>
                    {props.node.getChildren().map((child) => (
                        <Task
                            key={child.Id}
                            isFiltered={props.isFiltered}
                            node={child}
                            rowProps={props.rowProps}
                            style={{...props.style}}
                        />
                    ))}
                </div>
            </SubtasksProxy>
        );
    }, [open, props.node, props.rowProps.columns]);

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
        const removeOpenHandler = nodeToggleOpenHandler(props.node.Id, (val) =>
            setOpen((prev) => {
                return val ? val : !prev;
            })
        );
        return () => {
            removeOpenHandler();
        };
    }, []);

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

    if (props.node.Display === 'hidden') return null;

    return (
        <TaskNodeContext.Provider
            value={{
                open,
                node: props.node,
                isTaskFinished: isFinished(props.node.getTask()),
            }}
        >
            <div
                className={`${styles.task} ${
                    props.node.Display === 'disabled' ? styles.disabled : ''
                }`}
                style={{...props.style}}
            >
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
            {subtasksNode}
        </TaskNodeContext.Provider>
    );
};

export default Task;
