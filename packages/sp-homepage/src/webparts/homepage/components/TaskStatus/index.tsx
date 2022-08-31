import * as React from 'react';
import styles from './TaskStatus.module.scss';

export interface ITaskStatusProps extends React.HTMLAttributes<HTMLDivElement> {
    status: 'Open' | 'Pending' | 'Finished' | 'Cancelled' | 'Unknown'; 
}

export const TaskStatus: React.FC<ITaskStatusProps> = ({ status, className, ...props }) => {
    const s = status || 'Unknown';

    const statusClass = React.useMemo(() => {
        switch (s) {
            case 'Open':
                return styles.open;
            case 'Cancelled':
                return styles.cancelled;
            case 'Finished':
                return styles.finished;
            case 'Pending':
                return styles.pending;
            case 'Unknown':
                return styles.unknown;
        }
    }, [status]);

    return (
        <div {...props} className={[className, styles.container, statusClass].join(' ')} title={s} />
    );
};
