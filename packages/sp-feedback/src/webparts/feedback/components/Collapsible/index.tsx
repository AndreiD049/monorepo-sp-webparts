import * as React from 'react';
import styles from './Collapsible.module.scss';

export interface ICollapsibleProps {
    header: (collapsed: boolean) => JSX.Element;
}

export const Collapsible: React.FC<ICollapsibleProps> = (props) => {
    const [collapsed, setCollapsed] = React.useState(false);
    const header = React.useMemo(
        () => props.header(collapsed),
        [collapsed, props.header]
    );
    

    return (
        <div className={styles.container}>
            <div
                className={styles.headerButton}
                role="button"
                onClick={() => setCollapsed((prev) => !prev)}
            >
                {header}
            </div>
            <div className={collapsed ? styles.hidden : ''}>
                {props.children}
            </div>
        </div>
    );
};
