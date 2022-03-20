import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { CONTAINER_ID, EVENT_NAME } from './constants';
import SPNotificationContainer from './SPNotificationContainer';
import styles from './Notification.module.scss';
import { INotificationOptions } from './INotificationOptions';


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

initNotifications();