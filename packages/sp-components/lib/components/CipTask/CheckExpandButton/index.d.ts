import * as React from 'react';
export interface ICheckExpandButtonProps {
    taskId: number;
    open?: boolean;
    disabled?: boolean;
    taskFinished?: boolean;
    totalSubtasks: number;
    finishedSubtasks: number;
    onToggleOpen: (taskId: number, open: boolean) => void;
    onClick: () => void;
}
export declare const CheckExpandButton: React.FC<ICheckExpandButtonProps>;
