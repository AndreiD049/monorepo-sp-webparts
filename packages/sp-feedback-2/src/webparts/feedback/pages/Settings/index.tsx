import * as React from 'react';
import styles from './Settings.module.scss';
import { NavigationBar } from '../../components/NavigationBar';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { Icon } from 'office-ui-fabric-react';

export interface ISettingsProps {
    // Props go here
}

export const Settings: React.FC<ISettingsProps> = (props) => {
    const navigate = useNavigate();

    return (
        <div style={{ height: '100%' }}>
            <NavigationBar>
                <Link to="/">Home</Link>
                <Link to="/">Board</Link>
            </NavigationBar>
            <div className={styles.body}>
                <div className={styles.settingsNav}>
                    <p><Icon iconName='Settings' /> Settings</p>
                    <button className={styles.setting} onClick={() => navigate('general')}>General</button>
                    <button className={styles.setting} onClick={() => navigate('applications')}>Applications</button>
                </div>
                <div className={styles.outlet}>
                    <Outlet />
                </div>
            </div>
        </div>
    );
};
