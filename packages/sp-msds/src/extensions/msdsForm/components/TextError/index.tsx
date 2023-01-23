import * as React from 'react';
import styles from './TextError.module.scss';

export interface ITextErrorProps {
    error: string;
}

export const TextError: React.FC<ITextErrorProps> = (props) => {
    if (!props.error) return null;
    return <div className={styles.container}>{props.error}</div>;
};
