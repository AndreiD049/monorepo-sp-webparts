import * as React from 'react';
export interface IPillProps extends React.HTMLAttributes<HTMLElement> {
    value: string;
    disabled?: boolean;
}
export declare const Pill: React.FC<IPillProps>;
