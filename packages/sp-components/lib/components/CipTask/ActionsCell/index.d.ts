import * as React from 'react';
export interface IActionDetails {
    name: 'add' | 'commentAdd' | 'edit' | 'startTimer' | 'logTime' | 'delete' | 'move' | 'navigate';
    onClick: () => void;
}
export interface IActionsCellProps {
    disabled?: boolean;
    taskFinished?: boolean;
    items: IActionDetails[];
    overflowItems?: IActionDetails[];
    style?: React.CSSProperties;
}
export declare const ActionsCell: React.FC<IActionsCellProps>;
