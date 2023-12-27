import { IDetailsRowProps } from 'office-ui-fabric-react';
import * as React from 'react';
import { TaskNode } from './graph/TaskNode';
import TaskShimmer from './TaskShimmer';

export interface ISubtaskProxyProps {
    rowProps: IDetailsRowProps;
    node: TaskNode;
	subtasks: TaskNode[];
	onTaskRender: (node: TaskNode) => React.ReactNode;
}

const SubtasksProxy: React.FC<ISubtaskProxyProps> = ({
    rowProps,
    node,
	subtasks,
	onTaskRender
}) => {
	const task = node.getTask();
	const diff = task.Subtasks - subtasks.length;
    
	const content = subtasks.map((child) => onTaskRender(child));

	if (diff > 0) {
		const shimmers = new Array(diff).fill(<TaskShimmer rowProps={rowProps} parentNode={node} />);
		content.push(...shimmers);
	}

    return (
		<>{content}</>
	);
};

export default SubtasksProxy;
