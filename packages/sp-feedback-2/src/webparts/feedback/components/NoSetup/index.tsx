import * as React from 'react';
import styles from './NoSetup.module.scss';
import { IFeedbackWebPartProps } from '../../FeedbackWebPart';

export interface INoSetupProps {
    properties: IFeedbackWebPartProps
}

const CheckValueOk: React.FC<{ value: string }> = (props) => {
    return (
        <span>
            {props.value ? props.value : "(missing)"}
            <span className={`${styles.checkValueStatus} ${props.value ? styles.ok : styles.nok}`}>{props.value ? "OK" : "Not ok"}</span>
        </span>
    );
}

export const NoSetup: React.FC<INoSetupProps> = (props) => {
    return (
        <div className={styles.container}>
            <img className={styles.image} src={require('../../assets/settings.svg')} alt="Settings" />
            <div>
                <h2>Missing Setup!</h2>
                <p>
                    Hi, the setup for this webpart is not complete. Please check the webpart properties and make sure you have configured the webpart correctly.
                </p>
                <div>
                    <p>
                        <b className={styles.settingName}>Root Url:</b> <CheckValueOk value={props.properties?.listRootUrl} />
                    </p>
                    <p>
                        <b className={styles.settingName}>List name:</b> <CheckValueOk value={props.properties?.listTitle} />
                    </p>
                    <p>
                        <b className={styles.settingName}>Settings list name:</b> <CheckValueOk value={props.properties?.settingListTitle} />
                    </p>
                </div>
            </div>
        </div>
    );
};
