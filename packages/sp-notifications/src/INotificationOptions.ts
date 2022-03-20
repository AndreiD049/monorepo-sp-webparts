import { MessageBarType } from "office-ui-fabric-react";
import * as React from "react";

type IMessage = string | React.ReactElement;

export interface INotificationAction {
    text: string;
    onClick: () => void;
    dismiss?: boolean
};

export interface INotificationOptions {
    message: IMessage;
    messageType?: MessageBarType;
    isMultiline?: boolean;
    messageActions?: INotificationAction[];
    timeout?: number;
};