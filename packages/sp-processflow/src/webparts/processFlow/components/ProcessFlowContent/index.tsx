import { ICustomerFlow } from '@service/process-flow';
import * as React from 'react';
import { CustomerGroupPicker } from '../CustomerGroupPicker';
import { DBCustomersPicker } from '../DBCustomersPicker';
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
            <div className={styles.topInfo}>
                <CustomerGroupPicker
                    options={[props.flow.CustomerGroup]}
                    selectedOption={props.flow.CustomerGroup}
                    disabled
                    style={{
                        display: 'inline-block',
                    }}
                />
                <DBCustomersPicker
                    options={props.flow.DBCustomers || []}
                    selectedOptions={props.flow.DBCustomers || []}
                    disabled
                    style={{
                        display: 'inline-block',
                    }}
                />
            </div>
        </div>
    );
};
