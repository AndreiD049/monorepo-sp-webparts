import * as React from 'react';
import styles from './ActionsCell.module.scss';

export interface IActionsCellProps {
    // Props go here
}

export const ActionsCell: React.FC<IActionsCellProps> = (props) => {
    return (
        <div className={styles.container}>ActionsCell</div>
    );
};
