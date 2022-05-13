import { IDetailsRowProps } from 'office-ui-fabric-react';
import * as React from 'react';
import { REFRESH_SUBTASKS_EVT, RELINK_PARENT_EVT } from '../utils/constants';
import { TaskNode } from './graph/TaskNode';
import { ITaskOverview } from './ITaskOverview';
import Task from './Task';
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
            const sub = await getSubtasks(node.Id);
            onLoad(sub);
        }
        run();
        async function refreshSubtasks(evt) {
            if (
                evt.detail &&
                evt.detail.parentId &&
                evt.detail.parentId === node.Id
            ) {
                await run();
                document.dispatchEvent(new CustomEvent(RELINK_PARENT_EVT));
            }
        }
        document.addEventListener(REFRESH_SUBTASKS_EVT, refreshSubtasks);
        return () =>
            document.removeEventListener(REFRESH_SUBTASKS_EVT, refreshSubtasks);
    }, []);

    if (node.getType() !== 'proxy') return <>{children}</>;

    return (
        <>
            {node.getTask().SubtasksId.map(() => (
                <TaskShimmer rowProps={rowProps} parentNode={node} />
            ))}
        </>
    );
};

export default SubtasksProxy;
