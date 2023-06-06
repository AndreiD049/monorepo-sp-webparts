import * as React from 'react';
import styles from './NavigationBar.module.scss';

export interface INavigationBarProps {
    // Props go here
}

export const NavigationBar: React.FC<INavigationBarProps> = (props) => {
    return (
        <div className={`${styles.container} ${styles.layout}`}>
            <img src="https://placehold.co/40" alt="Logo" />
            {props.children}
        </div>
    );
};
