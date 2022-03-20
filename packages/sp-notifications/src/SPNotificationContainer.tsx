import { Guid } from "@microsoft/sp-core-library";
import { MessageBarType, Stylesheet } from "office-ui-fabric-react";
import * as React from "react";
import { useEffect } from "react";
import { useRef } from "react";
import { useState } from "react";
import { EVENT_NAME } from "./constants";
import SPNotification from "./SPNotification";
import styles from "./Notification.module.scss";
import { INotificationOptions } from "./INotificationOptions";

type NotificationDict = {
  [id: string]: INotificationOptions;
};

export default function SPNotificationContainer() {
  const [notifications, setNotifications] = useState<NotificationDict>({});
  const rootRef = useRef<HTMLDivElement>(null);

  const handleDismiss = (id: string) => () => {
    setNotifications(prev => {
      const copy = {...prev};
      delete copy[id];
      return copy;
    });
  }

  useEffect(() => {
    if (rootRef.current !== null) {
      const container: any = rootRef.current.parentElement;
      // Add listener to a custom event
      container.addEventListener(
        EVENT_NAME,
        (evt: CustomEvent<INotificationOptions>) => {
          const id = Guid.newGuid().toString();
          setNotifications((prev) => ({
            ...prev,
            [id]: evt.detail,
          }));
        },
        false
      );
    }
  }, [rootRef]);

  return (
    <div ref={rootRef} className={styles.notificationWrapper}>
      {Object.keys(notifications).map((k) => (
        <SPNotification
          key={k}
          messsageType={notifications[k].messageType || MessageBarType.info}
          content={notifications[k].message}
          isMultiline={notifications[k].isMultiline || true}
          onDismiss={handleDismiss(k)}
          timeout={notifications[k].timeout || 5000}
          actions={notifications[k].messageActions || []}
        />
      ))}
    </div>
  );
}
