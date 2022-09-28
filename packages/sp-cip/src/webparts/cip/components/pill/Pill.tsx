import * as React from 'react';
import styles from './Pill.module.scss';

export interface IPillProps extends React.HTMLAttributes<HTMLElement> {
    value: string;
    disabled?: boolean;
}

const Pill: React.FC<IPillProps> = ({ value, id, disabled, ...rest }) => {
    const classNames = React.useMemo(() => {
        let result = `${styles['pill-container__inner']} ${rest.className}`;
        if (disabled) {
            result += ` ${styles.disabled}`;
        } else {
            result += ` sp-cip-pill-${value.toLowerCase()}`;
        }
        return result;
    }, [value, disabled])
    return (
        <div className={styles['pill-container']}>
            <button
                id={id}
                {...rest}
                disabled={disabled}
                className={classNames}
                style={{ ...rest.style }}
            >
                {value}
            </button>
        </div>
    );
};

export default Pill;
