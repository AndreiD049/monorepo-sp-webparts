import { IProcess } from '@service/process-flow';
import { ActionButton, IconButton } from 'office-ui-fabric-react';
import * as React from 'react';
import { hideCallout, showCallout } from 'sp-components';
import { MAIN_CALLOUT, MANUAL_SEPARATOR } from '../../../utils/constants';
import styles from './ProcessCell.module.scss';

export interface IProcessCellProps {
    process: IProcess;
}

const ManualLinks: React.FC<{ manuals: string[][] }> = (props) => {
    return (
        <div className={styles.links}>
            {props.manuals.map((m) => (
                <ActionButton
                    key={m[0] + m[1]}
                    iconProps={{ iconName: 'OpenInNewTab' }}
                    onClick={() => {
                        window.open(m[1], '_blank', 'noreferrer,noopener');
                        hideCallout(MAIN_CALLOUT);
                    }}
                >
                    {m[0]}
                </ActionButton>
            ))}
        </div>
    );
};

export const ProcessCell: React.FC<IProcessCellProps> = (props) => {
    const buttonRef = React.useRef(null);
    const handleManualsOpen = React.useCallback(() => {
        if (!props.process.Manual) return null;
        const lines = props.process.Manual.split('\n')
            .filter((l) => l !== '')
            .map((l) => l.split(MANUAL_SEPARATOR));
        if (lines.length === 1) {
            window.open(lines[0][1], '_blank', 'noreferrer,noopener');
        } else {
            showCallout({
                id: MAIN_CALLOUT,
                calloutProps: {
                    target: buttonRef,
                },
                content: <ManualLinks manuals={lines} />,
            });
        }
    }, [props.process, buttonRef]);

    return (
        <div className={styles.container}>
            <span>{props.process.Title}</span>
            {props.process.Manual && (
                <IconButton
                    elementRef={buttonRef}
                    className={styles.manualInfo}
                    iconProps={{ iconName: 'BookAnswers' }}
                    onClick={handleManualsOpen}
                />
            )}
        </div>
    );
};
