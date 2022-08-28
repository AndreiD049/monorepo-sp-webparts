import { Spinner, SpinnerSize } from 'office-ui-fabric-react';
import * as React from 'react';
import styles from './LoadingSpinner.module.scss';

export interface ILoadingSpinnerProps {
    // Props go here
}

export const LoadingSpinner: React.FC<ILoadingSpinnerProps> = (props) => {
    return (
        <div className={styles.container}>
            <Spinner size={SpinnerSize.large} label="Please wait" labelPosition={'bottom'} />
        </div>
    );
};
