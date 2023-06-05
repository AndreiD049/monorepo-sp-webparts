import * as React from 'react';
import styles from './Board.module.scss';

export interface IBoardProps {
    // Props go here
}

export const Board: React.FC<IBoardProps> = (props) => {
    return (
        <div className={styles.container}>Board</div>
    );
};
