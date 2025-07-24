import { IProcess, readManualJson } from '@service/process-flow';
import { IManualJson } from '@service/process-flow/dist/models';
import { ActionButton, IconButton } from '@fluentui/react';
import * as React from 'react';
import { hideCallout, showCallout, showPanel } from 'sp-components';
import { MAIN_CALLOUT, PANEL_MANUALS } from '../../../utils/constants';
import { ManualPanelDetails } from '../../ManualPanelDetails';
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
                        hideCallout(MAIN_CALLOUT);
						showPanel(
							PANEL_MANUALS,
							{
								headerText: m.Name,
							},
							<ManualPanelDetails manual={m} />
						);
                    }}
                >
                    {m.Name} { m.Filename ? `(${m.Filename})` : '' }
                </ActionButton>
            ))}
        </div>
    );
};

export const ProcessCell: React.FC<IProcessCellProps> = (props) => {
	const containerRef = React.useRef(null);
    const buttonRef = React.useRef(null);

    const handleManualsOpen = React.useCallback(() => {
        if (!props.process.Manual) return null;
		const manuals = readManualJson(props.process.Manual);
		if (manuals.length === 1) {
			showPanel(
				PANEL_MANUALS,
				{
					headerText: manuals[0].Name,
				},
				<ManualPanelDetails manual={manuals[0]} />
			)
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

    React.useEffect(() => {
        if (containerRef.current) {
            const parent = containerRef.current.parentElement;
            parent.classList.add(styles.stickyCol);
        }
    }, [containerRef])

    return (
        <div ref={containerRef} className={styles.container} title={props.process.Title}>
            <span>{props.process.Title}</span>
            {props.process.Manual && props.process.Manual !== '[]' && (
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
