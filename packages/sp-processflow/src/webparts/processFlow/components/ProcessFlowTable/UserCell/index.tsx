import { IProcess, IUserProcess } from '@service/process-flow';
import { IUserProps } from '@service/users';
import { MessageBarType } from 'office-ui-fabric-react';
import * as React from 'react';
import { showDialog } from 'sp-components';
import { SPnotify } from 'sp-react-notifications';
import { MAIN_DIALOG } from '../../../utils/constants';
import { copyUserProcess, pasteUserProcess } from '../../../utils/events';
import { ChangeStatusDialog } from '../../ChangeStatusDialog';
import styles from './UserCell.module.scss';

export interface IUserCellProps {
    userProcess: IUserProcess;
    user: IUserProps;
    process: IProcess;
}

export const UserCell: React.FC<IUserCellProps> = (props) => {
    const className = React.useMemo(
        () =>
            `${styles.container} sp-processflow-${
                Boolean(props.userProcess)
                    ? props.userProcess.Status.toLowerCase()
                    : 'na'
            }`,
        [props.userProcess]
    );

    const handleShowDialog = React.useCallback(() => {
        showDialog({
            id: MAIN_DIALOG,
            content: (
                <ChangeStatusDialog
                    process={props.process}
                    user={props.user}
                    userProcess={props.userProcess}
                />
            ),
            dialogProps: {
                dialogContentProps: {
                    title: props.process.Title,
                },
                minWidth: 400,
            },
        });
    }, [props.process, props.userProcess]);

    const content = React.useMemo(() => {
        if (!props.userProcess) {
            return null;
        }
        if (props.userProcess.Date) {
            return new Date(props.userProcess.Date).toLocaleDateString();
        }
        return props.userProcess.Status;
    }, [props.userProcess]);

    const buttonTitle = React.useMemo(() => {
        if (!props.userProcess) return '';
        let content = `Process: ${props.process.Title}\nUser: ${props.user.Title}\nStatus: ${props.userProcess?.Status}\n`;
        if (props.userProcess.Date) {
            content += `Date: ${new Date(props.userProcess?.Date).toLocaleDateString()}`;
        }
        return content;
    }, [props.userProcess]);

    return (
        <button
            title={buttonTitle}
            className={className}
            onContextMenu={(ev) => {
                ev.preventDefault();
            }}
            onKeyDown={(ev) => {
                // Copy
                if (ev.key.toLowerCase() === 'c' && ev.ctrlKey) {
                    if (props.userProcess) {
                        copyUserProcess(props.userProcess);
                        SPnotify({
                            message: `Copied:\nStatus: ${
                                props.userProcess.Status
                            }\nDate: ${new Date(
                                props.userProcess.Date
                            ).toLocaleDateString()}`,
                            messageType: MessageBarType.success,
                        });
                    } else {
                        SPnotify({
                            message: `Cannot copy empty.`,
                            messageType: MessageBarType.severeWarning,
                        });
                    }
                } else if (ev.key.toLowerCase() === 'v' && ev.ctrlKey) {
                    pasteUserProcess({
                        processId: props.process.Id,
                        userId: props.user.Id,
                    });
                }
            }}
            onClick={() => handleShowDialog()}
        >
            {content}
        </button>
    );
};
