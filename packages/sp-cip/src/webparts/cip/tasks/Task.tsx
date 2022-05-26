import { IDetailsRowProps } from 'office-ui-fabric-react';
import * as React from 'react';
import { ITaskOverview } from './ITaskOverview';
import styles from './Task.module.scss';
import { TaskNode } from './graph/TaskNode';
import { RenderCell } from './Cells/render-cells';
import { nodeToggleOpenHandler, relinkParent } from '../utils/dom-events';
import SubtasksProxy from './SubtasksProxy';
import { GlobalContext } from '../utils/GlobalContext';

function initialOpen(node: TaskNode, isFiltered: boolean) {
    if (!isFiltered) return false;
    if (!node.hasChildren()) return false;
    if (node.getChildren().some((c) => c.isFilterApplicable)) return true;
    return node.getChildren().some((c) => initialOpen(c, isFiltered));
}

export interface ITaskProps {
    rowProps: IDetailsRowProps;
    node: TaskNode;
    setTasks: React.Dispatch<React.SetStateAction<ITaskOverview[]>>;
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
    const { theme } = React.useContext(GlobalContext);
    const [open, setOpen] = React.useState<boolean>(false);

    React.useEffect(() => {
        setOpen(initialOpen(props.node, props.isFiltered));
    }, [props.isFiltered]);

    const subtasksNode = React.useMemo(() => {
        if (!open) return null;
        if (props.node.Display === 'hidden') return null;
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
                            return [...filtered, ...tasks];
                        });
                    }
                }}
            >
                <div>
                    {props.node.getChildren().map((child) => (
                        <Task
                            isFiltered={props.isFiltered}
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
            setOpen((prev) => {
                let next = props.node;
                while (next.getParent()) {
                    relinkParent(next.getNextSibling()?.Id);
                    next = next.getParent();
                }
                return !prev;
            })
        );
        return () => {
            removeOpenHandler();
        };
    }, []);

    if (props.node.Display === 'hidden') return null;

    return (
        <>
            <div className={`${styles.task} ${props.node.Display === 'disabled' ? styles.disabled : ''}`}>
                {props.rowProps.columns.map((column) => {
                    return (
                        <div
                            key={column.fieldName}
                            className={styles.task__cell}
                            style={{
                                width: column.calculatedWidth,
                            }}
                        >
                            <RenderCell
                                fieldName={column.fieldName}
                                node={props.node}
                            />
                        </div>
                    );
                })}
            </div>
            {subtasksNode}
        </>
    );
};

export default Task;
