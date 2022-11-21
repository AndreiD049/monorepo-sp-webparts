import { ICustomerFlow } from '@service/process-flow';
import * as React from 'react';
import { ProcessFlowTable } from '../ProcessFlowTable';
import styles from './ProcessFlowContent.module.scss';

export interface IProcessFlowContentProps {
    flow: ICustomerFlow;
}

export const ProcessFlowContent: React.FC<IProcessFlowContentProps> = (
    props
) => {
    if (!props.flow) {
        return null;
    }
    return (
        <div className={styles.container}>
            <div>
                <ProcessFlowTable flow={props.flow} />
            </div>
        </div>
    );
};
