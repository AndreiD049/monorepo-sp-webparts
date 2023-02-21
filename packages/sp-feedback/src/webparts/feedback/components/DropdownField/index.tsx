import * as React from 'react';
import styles from './DropdownField.module.scss';

export interface IDropdownFieldProps {
    // Props go here
}

export const DropdownField: React.FC<IDropdownFieldProps> = (props) => {
    return (
        <div className={styles.container}>DropdownField</div>
    );
};
