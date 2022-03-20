import { MessageBar, MessageBarButton, MessageBarType } from "office-ui-fabric-react";
import * as React from "react";
import { FC } from "react";
import { INotificationAction } from "./INotificationOptions";
import styles from './Notification.module.scss';

export interface ISPNotificationProps {
    messsageType: MessageBarType;
    content: React.ReactElement | string;
    isMultiline?: boolean;
    onDismiss: () => void;
    timeout: number;
    actions: INotificationAction[];
}

const SPNotification: FC<ISPNotificationProps> = (props) => {
    
    React.useEffect(() => {
        const timer = setTimeout(props.onDismiss, props.timeout);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className={styles.notification} >
            <MessageBar
                messageBarType={props.messsageType}
                isMultiline={props.isMultiline === undefined ? true : props.isMultiline}
                dismissButtonAriaLabel="Close"
                truncated={true}
                onDismiss={props.onDismiss}
                overflowButtonAriaLabel="See more"
                actions={
                    <div>
                        {props.actions.map(action => (
                            <MessageBarButton onClick={() => {
                                action.onClick();
                                action.dismiss && props.onDismiss();
                            }}>
                                {action.text}
                            </MessageBarButton>
                        ))}
                    </div>
                }
            >
                {props.content}
            </MessageBar>
        </div>
    )
};

export default SPNotification;
