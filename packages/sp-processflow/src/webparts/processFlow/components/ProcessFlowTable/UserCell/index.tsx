import { IProcess, IUserProcess } from '@service/process-flow';
import { IUserProps } from '@service/users';
import * as React from 'react';
import { showDialog } from 'sp-components';
import { MAIN_DIALOG } from '../../../utils/constants';
import { ChangeStatusDialog } from '../../ChangeStatusDialog';
import styles from './UserCell.module.scss';

export interface IUserCellProps {
    userProcess: IUserProcess;
    user: IUserProps;
    process: IProcess;
}

export const UserCell: React.FC<IUserCellProps> = (props) => {
    const isNa = React.useMemo(() => !Boolean(props.userProcess), [props.userProcess]);
    const status = React.useMemo(() => isNa ? 'na' : props.userProcess?.Status.toLowerCase(), [isNa, props.userProcess]);
    const className = `${styles.container} sp-processflow-${status}`;

    const handleShowDialog = React.useCallback(() => {
        showDialog({
            id: MAIN_DIALOG,
            content: <ChangeStatusDialog process={props.process} user={props.user} userProcess={props.userProcess} />,
            dialogProps: {
                dialogContentProps: {
                    title: props.process.Process,
                },
                minWidth: 400,
            },
        })
    }, [props.process, props.userProcess]);
    
    return (
        <button className={className} onClick={() => handleShowDialog()}>{isNa ? 'NA' : props.userProcess.Status}</button>
    );
};
