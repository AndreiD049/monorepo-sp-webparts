import { ICustomerFlow } from '@service/process-flow';
import * as React from 'react';
import styles from './ProcessFlowTable.module.scss';

export interface IProcessFlowTableProps {
    flow?: ICustomerFlow;
}

export const ProcessFlowTable: React.FC<IProcessFlowTableProps> = (props) => {
    if (!props.flow) return null;
    return (
        <div className={styles.container}>ProcessFlowTable</div>
    );
};
