import * as React from 'react';
import styles from './Pill.module.scss';

export interface IPillProps extends React.HTMLAttributes<HTMLDivElement> {
    // Props go here
}

export const Pill: React.FC<IPillProps> = ({ className, ...props }) => {
    return (
        <div className={[className, styles.container].join(' ')} {...props}>
            {props.children}
        </div>
    );
};
