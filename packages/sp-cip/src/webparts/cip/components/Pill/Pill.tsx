import * as React from 'react';
import styles from './Pill.module.scss';

export interface IPillProps extends React.HTMLAttributes<HTMLDivElement> {
    value: string;
}

const Pill: React.FC<IPillProps> = ({ value, ...rest }) => {
    return (
        <div className={styles['pill-container']}>
            <div
                {...rest}
                className={`${
                    styles['pill-container__inner']
                } ${value.toLowerCase()} ${rest.className}`}
                style={{ ...rest.style }}
            >
                {value}
            </div>
        </div>
    );
};

export default Pill;
