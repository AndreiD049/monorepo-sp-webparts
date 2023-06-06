import * as React from 'react';
import styles from './Home.module.scss';
import { Link } from 'react-router-dom';
import { NavigationBar } from '../../components/NavigationBar';

export interface IHomeProps {
    // Props go here
}

export const Home: React.FC<IHomeProps> = (props) => {
    return (
        <div className={styles.container}>
            <NavigationBar>
                <Link to="/board">Board</Link>
                <Link to="/new">New feedback</Link>
                <Link to="/settings">Settings</Link>
            </NavigationBar>
            <p>Home</p>
        </div>
    );
};
