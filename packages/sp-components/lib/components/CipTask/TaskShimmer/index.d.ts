import { IDetailsRowProps } from 'office-ui-fabric-react';
import * as React from 'react';
import { TaskNode } from '@service/sp-cip';
interface ITaskShimmerProps {
    rowProps: IDetailsRowProps;
    parentNode: TaskNode;
}
export declare const TaskShimmer: React.FC<ITaskShimmerProps>;
export {};
