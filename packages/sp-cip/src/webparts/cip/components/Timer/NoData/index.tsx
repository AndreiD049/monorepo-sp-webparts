import * as React from 'react';
import styles from './NoData.module.scss';

export interface INoDataProps {
    // Props go here
}

export const NoData: React.FC<INoDataProps> = (props) => {
    return (
        <div className={styles.container}>No timers...</div>
    );
};
