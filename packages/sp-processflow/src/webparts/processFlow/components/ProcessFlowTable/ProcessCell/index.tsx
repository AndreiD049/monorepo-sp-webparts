import { IProcess, readManualJson } from '@service/process-flow';
import { IManualJson } from '@service/process-flow/dist/models';
import { ActionButton, IconButton } from 'office-ui-fabric-react';
import * as React from 'react';
import { hideCallout, showCallout } from 'sp-components';
import { MAIN_CALLOUT } from '../../../utils/constants';
import styles from './ProcessCell.module.scss';

export interface IProcessCellProps {
    process: IProcess;
}

const ManualLinks: React.FC<{ manuals: IManualJson[] }> = (props) => {
    return (
        <div className={styles.links}>
            {props.manuals.map((m) => (
                <ActionButton
                    key={m.Link + m.Name}
                    iconProps={{ iconName: 'OpenInNewTab' }}
                    onClick={() => {
                        window.open(m.Link, '_blank', 'noreferrer,noopener');
                        hideCallout(MAIN_CALLOUT);
                    }}
                >
                    {m.Filename || m.Name}
                </ActionButton>
            ))}
        </div>
    );
};

export const ProcessCell: React.FC<IProcessCellProps> = (props) => {
    const buttonRef = React.useRef(null);
    const handleManualsOpen = React.useCallback(() => {
        if (!props.process.Manual) return null;
		const manuals = readManualJson(props.process.Manual);
		if (manuals.length === 1) {
			window.open(manuals[0].Link, '_blank', 'noreferrer,noopener');
		} else {
            showCallout({
                id: MAIN_CALLOUT,
                calloutProps: {
                    target: buttonRef,
                },
                content: <ManualLinks manuals={manuals} />,
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
