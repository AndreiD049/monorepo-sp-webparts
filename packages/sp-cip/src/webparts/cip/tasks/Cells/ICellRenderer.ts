import { IColumn, IDetailsRowProps } from 'office-ui-fabric-react';
import { TaskNode } from '../graph/TaskNode';

export type ICellRenderer = (
    node: TaskNode,
    nestLevel: number,
) => React.ReactElement;
