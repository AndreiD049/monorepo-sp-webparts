import * as React from 'react';
export interface ITaskPersona extends React.HTMLAttributes<HTMLDivElement> {
    title: string;
    email: string;
}
export declare const TaskPersona: React.FC<ITaskPersona>;
