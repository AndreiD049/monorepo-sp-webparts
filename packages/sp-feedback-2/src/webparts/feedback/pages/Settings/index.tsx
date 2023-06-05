import * as React from 'react';
import styles from './Settings.module.scss';

export interface ISettingsProps {
    // Props go here
}

export const Settings: React.FC<ISettingsProps> = (props) => {
    return (
        <div className={styles.container}>Settings</div>
    );
};
