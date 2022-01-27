import * as React from 'react';
import styles from './Appraisals.module.scss';
import { IAppraisalsProps } from './IAppraisalsProps';
import { Guid } from '@microsoft/sp-core-library';

const Appraisals: React.FC<IAppraisalsProps> = (props) => {
    const url = new URL(window.location.href);
    const isPeriods = url.searchParams.get('periodId');
    const id = Guid.newGuid().toString();

    return isPeriods ? (
        <div className={styles.appraisals}>
            <div className={styles.container}>
                <h1>Welcome to Appraisals</h1>
                <div>{props.description}</div>
            </div>
        </div>
    ) : (
        <>{id}</>
    );
};

export default Appraisals;
