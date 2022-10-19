import * as React from 'react';
export interface IDueDateCellCalloutProps {
    date: Date;
    onDateChange: (date: Date) => void;
}
export interface IDueDateCellProps {
    dueDate: Date;
    disabled?: boolean;
    calloutId?: string;
    onDateChange?: (date: Date) => void;
}
export declare const DueDateCell: React.FC<IDueDateCellProps>;
