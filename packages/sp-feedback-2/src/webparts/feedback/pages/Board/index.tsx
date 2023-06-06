import * as React from 'react';
import styles from './Board.module.scss';
import { NavigationBar } from '../../components/NavigationBar';
import { Link } from 'react-router-dom';

export interface IBoardProps {
    // Props go here
}

export const Board: React.FC<IBoardProps> = (props) => {
    return (
        <div className={styles.container}>
            <NavigationBar>
                <Link to="/board">Board</Link>
                <Link to="/new">New feedback</Link>
                <Link to="/settings">Settings</Link>
            </NavigationBar>
            <div>Board</div>
        </div>
    );
};
