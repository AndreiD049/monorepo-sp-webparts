import * as React from 'react';
import styles from './Pill.module.scss';

export interface IPillProps extends React.HTMLAttributes<HTMLElement> {
    value: string;
    disabled?: boolean;
    containerStyles?: React.CSSProperties;
}

export const Pill: React.FC<IPillProps> = ({ value, id, disabled, ...rest }) => {
    const classNames = React.useMemo(() => {
        let result = `${styles.pillContainerInner} ${rest.className}`;
        if (disabled) {
            result += ` ${styles.disabled}`;
        }
        return result;
    }, [disabled, rest.className])

    return (
        <div className={styles.pillContainer} style={{...rest.containerStyles}}>
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
