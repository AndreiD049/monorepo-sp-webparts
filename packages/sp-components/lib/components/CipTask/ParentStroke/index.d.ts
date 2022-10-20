import * as React from 'react';
export interface IParentStrokeProps {
    taskId: number;
    prevSiblingId?: number;
    parentId?: number;
}
export declare const ParentStroke: React.FC<IParentStrokeProps>;
