import * as React from 'react';
import { ITaskOverview } from '@service/sp-cip/dist/models/ITaskOverview';
export interface IPriorityCellCalloutProps {
    choices: string[];
    currentChoice: string;
    handleClick: (choice: string) => void;
}
export interface IPriorityCellProps {
    task: ITaskOverview;
    choices: string[];
    disabled?: boolean;
    calloutId?: string;
    onChangePriority: (priority: string) => void;
    className?: string;
    style?: React.CSSProperties;
}
export declare const PriorityCell: React.FC<IPriorityCellProps>;
