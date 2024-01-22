import { ActionButton, IDetailsRowProps } from '@fluentui/react';
import * as React from 'react';
import { relinkParent } from '../utils/dom-events';
import { TaskNode } from './graph/TaskNode';
import TaskShimmer from './TaskShimmer';

export interface ISubtaskProxyProps {
    rowProps: IDetailsRowProps;
    node: TaskNode;
    subtasks: TaskNode[];
    onTaskRender: (node: TaskNode) => React.ReactNode;
}

const FinishedSubtasksToggle: React.FC<
    { count: number } & React.HTMLAttributes<HTMLSpanElement>
> = (props) => {
    const [show, setShow] = React.useState(false);

    const handleToggle = (): void => {
		relinkParent('all');
		setShow(!show);
	};

    const label = show
        ? `${props.count} finished subtasks`
        : `${props.count} finished subtasks`;
    const iconName = show ? 'View' : 'Hide3' ;

    return (
        <>
            <ActionButton
                iconProps={{ iconName }}
                role="button"
                onClick={handleToggle}
                {...props}
            >
                {label}
            </ActionButton>
            {show && props.children}
        </>
    );
};

const SubtasksProxy: React.FC<ISubtaskProxyProps> = ({
    rowProps,
    node,
    subtasks,
    onTaskRender,
}) => {
    const task = node.getTask();
    const diff = task.Subtasks - subtasks.length;

    const openSubtasks = subtasks
        .filter((st) => st.getTask().FinishDate === null)
        .map((st) => onTaskRender(st));

    const closedSubtasks =
        openSubtasks.length !== subtasks.length
            ? subtasks
                  .filter((st) => st.getTask().FinishDate !== null)
                  .map((st) => onTaskRender(st))
            : [];

    if (diff > 0) {
        const shimmers = new Array(diff).fill(
            <TaskShimmer rowProps={rowProps} parentNode={node} />
        );
        openSubtasks.push(...shimmers);
    }

    if (openSubtasks.length === 0) {
        return <>{closedSubtasks}</>;
    }

    if (closedSubtasks.length === 0) {
        return <>{openSubtasks}</>;
    }

    return (
        <>
            {openSubtasks}
            <FinishedSubtasksToggle
                count={closedSubtasks.length}
                style={{
                    margin: `.3em 0 .3em ${(node.level + 1) * 30 + 40}px`,
                    fontSize: '1em',
                    height: '2em',
					display: 'block',
                }}
            >
                {closedSubtasks}
            </FinishedSubtasksToggle>
        </>
    );
};

export default SubtasksProxy;
