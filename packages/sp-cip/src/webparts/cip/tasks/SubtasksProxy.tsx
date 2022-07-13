import { IDetailsRowProps } from 'office-ui-fabric-react';
import * as React from 'react';
import { TaskNode } from './graph/TaskNode';
import { ITaskOverview } from './ITaskOverview';
import TaskShimmer from './TaskShimmer';
import { useTasks } from './useTasks';

export interface ISubtaskProxyProps {
    rowProps: IDetailsRowProps;
    node: TaskNode;
    onLoad: (tasks: ITaskOverview[]) => void;
    children?: React.ReactNode;
}

const SubtasksProxy: React.FC<ISubtaskProxyProps> = ({
    rowProps,
    node,
    onLoad,
    children,
}) => {
    const { getSubtasks } = useTasks();

    React.useEffect(() => {
        async function run() {
            if (node.getType() === 'proxy') {
                const sub = await getSubtasks(node.Id);
                onLoad(sub);
            }
        }
        run();
    }, [node]);

    if (node.getType() !== 'proxy') return <>{children}</>;
    
    const shimmers = new Array(node.getTask().Subtasks).fill(<TaskShimmer rowProps={rowProps} parentNode={node} />);

    return (<>{shimmers.map((sh) => sh)}</>);
};

export default SubtasksProxy;
