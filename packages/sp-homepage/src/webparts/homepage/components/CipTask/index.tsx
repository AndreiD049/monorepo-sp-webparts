import * as React from 'react';
import styles from './CipTask.module.scss';

export interface ICipTaskProps {
    // Props go here
}

export const CipTask: React.FC<ICipTaskProps> = (props) => {
    return (
        <div className={styles.container}>CipTask</div>
    );
};
