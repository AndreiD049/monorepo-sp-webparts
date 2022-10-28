import * as React from 'react';
import styles from './ProcessFlow.module.scss';

export interface IProcessFlowProps {
    // Props go here
}

export const ProcessFlow: React.FC<IProcessFlowProps> = () => {
    return (<div className={styles.processFlow}>test</div>);
};
