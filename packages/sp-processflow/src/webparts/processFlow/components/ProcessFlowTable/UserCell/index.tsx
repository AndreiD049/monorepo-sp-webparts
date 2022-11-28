import { IUserProcess } from '@service/process-flow';
import * as React from 'react';
import styles from './UserCell.module.scss';

export interface IUserCellProps {
    userProcess: IUserProcess;
}

export const UserCell: React.FC<IUserCellProps> = (props) => {
    const isNa = React.useMemo(() => !Boolean(props.userProcess), [props.userProcess]);
    const status = React.useMemo(() => isNa ? 'NA' : props.userProcess?.Status, [isNa]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const s = styles as any;
    return (
        <div className={`${styles.container} ${s[status.toLowerCase()]}`}>{isNa ? null : props.userProcess.Status}</div>
    );
};
