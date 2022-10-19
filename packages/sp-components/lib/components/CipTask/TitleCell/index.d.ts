import * as React from 'react';
export interface ITitleCellProps {
    taskId: number;
    title: string;
    comments: number;
    attachments: number;
    orphan?: boolean;
    level?: number;
    totalSubtasks: number;
    finishedSubtasks: number;
    open?: boolean;
    buttonDisabled?: boolean;
    taskFinished?: boolean;
    onDoubleClick?: () => void;
    onClick?: () => void;
    onToggleOpen?: (taskId: number, open: boolean) => void;
    style?: React.CSSProperties;
}
export declare const TitleCell: React.FC<ITitleCellProps>;
