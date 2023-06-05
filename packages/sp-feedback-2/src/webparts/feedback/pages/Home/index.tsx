import * as React from 'react';
import styles from './Home.module.scss';
import { Link } from 'react-router-dom';

export interface IHomeProps {
    // Props go here
}

export const Home: React.FC<IHomeProps> = (props) => {
    return (
        <div className={styles.container}>
            <nav>
                <Link to="/board">Board</Link>
                <Link to="/new">New feedback</Link>
                <Link to="/settings">Settings</Link>
            </nav>
            <p>Home</p>
        </div>
    );
};
