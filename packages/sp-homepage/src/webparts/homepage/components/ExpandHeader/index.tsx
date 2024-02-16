import { Icon } from '@fluentui/react';
import * as React from 'react';
import styles from './ExpandHeader.module.scss';

export interface IExpandHeaderProps {
    header: string | JSX.Element;
}

export const ExpandHeader: React.FC<IExpandHeaderProps> = (props) => {
    const [open, setOpen] = React.useState(true);

    const handleClick = (): void => setOpen((prev) => !prev);

    return (
        <div className={styles.container}>
            <div role="button" onClick={handleClick} className={styles.header}>
                <Icon iconName={open ? 'ChevronDownSmall' : 'ChevronRightSmall'} />
                {props.header}
            </div>
            {open && <div className={styles.content}>{props.children}</div>}
        </div>
    );
};
