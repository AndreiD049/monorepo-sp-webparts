import { TaskNode } from '../graph/TaskNode';

export type ICellRenderer = (
    node: TaskNode,
    nestLevel: number,
) => React.ReactElement;
