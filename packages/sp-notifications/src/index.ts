import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { CONTAINER_ID, EVENT_NAME } from './constants';
import SPNotificationContainer from './SPNotificationContainer';
import styles from './Notification.module.scss';
import { INotificationOptions } from './INotificationOptions';
import { MessageBarType } from 'office-ui-fabric-react';


export function initNotifications() {
    let messageContainer = document.getElementById(CONTAINER_ID);
    if (messageContainer === null) {
        messageContainer = document.createElement('div');
        messageContainer.id = CONTAINER_ID;
        messageContainer.className = styles.container;
        document.body.appendChild(messageContainer);
    }
    const element = React.createElement(SPNotificationContainer);
    ReactDOM.render(element, messageContainer);
}

export function SPnotify(options: INotificationOptions) {
    const container = document.getElementById(CONTAINER_ID);
    const event = new CustomEvent<INotificationOptions>(EVENT_NAME, {
        detail: options,
    });
    if (container !== null) {
        container.dispatchEvent(event);
    }
}

export function SPnotifyError(message: string) {
    SPnotify({
        message,
        messageType: MessageBarType.error,
    });
}

export function SPnotifyWarning(message: string) {
    SPnotify({
        message,
        messageType: MessageBarType.warning,
    });
}

export function SPnotifySuccess(message: string) {
    SPnotify({
        message,
        messageType: MessageBarType.success,
    });
}

export function SPnotifyInfo(message: string) {
    SPnotify({
        message,
        messageType: MessageBarType.info,
    });
}

export function SPnotifySevereWarning(message: string) {
    SPnotify({
        message,
        messageType: MessageBarType.severeWarning,
    });
}

initNotifications();