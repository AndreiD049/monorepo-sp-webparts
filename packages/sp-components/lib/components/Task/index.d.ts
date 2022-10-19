import { IDropdownOption } from 'office-ui-fabric-react';
import { IUser } from '../../models';
import * as React from 'react';
import { IReadonlyTheme } from '@microsoft/sp-component-base';
export interface ITaskInfo {
    description: string;
    title: string;
    user: IUser;
    date: string;
    time: string;
    status: string;
    remark?: string;
}
export interface ITaskProps {
    info: ITaskInfo;
    expired: boolean;
    isHovering: boolean;
    currentUserId: number;
    canEditOthers: boolean;
    onChange: (ev: {}, option: IDropdownOption | undefined) => void;
    TaskPersona?: JSX.Element;
    className?: string;
    style?: React.CSSProperties;
    theme?: IReadonlyTheme;
}
export declare const Task: React.FC<ITaskProps>;
