import { IDetailsRowProps } from 'office-ui-fabric-react';
import * as React from 'react';
import { getSubtasks } from '../utils/dom-events';
import { TaskNode } from './graph/TaskNode';
import TaskShimmer from './TaskShimmer';

export interface ISubtaskProxyProps {
    rowProps: IDetailsRowProps;
    node: TaskNode;
    children?: React.ReactNode;
}

const SubtasksProxy: React.FC<ISubtaskProxyProps> = ({
    rowProps,
    node,
    children,
}) => {
	React.useEffect(() => {
		if (node.getType() === 'proxy') {
			getSubtasks(node.getTask());
		}
	}, []);

	if (node.getType() !== 'proxy') {
		return <>{children}</>
	}

    
    const shimmers = new Array(node.getTask().Subtasks).fill(<TaskShimmer rowProps={rowProps} parentNode={node} />);

    return (<>{shimmers.map((sh) => sh)}</>);
};

export default SubtasksProxy;
