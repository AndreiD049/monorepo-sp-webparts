import { ITaskOverview } from '@service/sp-cip/dist/models/ITaskOverview';
import * as React from 'react';
import { Callout, hideCallout, showCallout } from '../../Callout';
import { Pill } from '../../Pill';
import styles from './StatusCell.module.scss';

const CALLOUT_ID = 'sp-components-status-callout';

export interface IStatusCellCalloutProps {
    currentChoice: string;
    choices: string[];
    onStatusChange: (choice: string) => void;
}

const StatusCellCallout: React.FC<IStatusCellCalloutProps> = (props) => {
    return (
        <div className={`${styles.callout} ${styles['center-content']}`}>
            {props.choices.map((choice) => (
                <Pill
                    key={choice}
                    onClick={() => props.onStatusChange(choice)}
                    value={choice}
                    disabled={choice === props.currentChoice}
                    className={`sp-cip-pill-${choice.toLowerCase().replace(/\s/g, '-')}`}
                    style={{ lineHeight: '12px' }}
                />
            ))}
        </div>
    );
};

export interface IStatusCellProps {
    task: ITaskOverview;
    statuses: string[];
    onStatusChange: (status: string) => void;
    onError: (err: string) => void;

    disabled?: boolean;

    // callout
    calloutId?: string;
}

export const StatusCell: React.FC<IStatusCellProps> = (props) => {
    const calloutId = props.calloutId ?? CALLOUT_ID;
    const pillRef = React.useRef(null);
    const handleClick = React.useCallback(() => {
        showCallout({
            id: calloutId,
            calloutProps: {
                target: pillRef,
            },
            content: (
                <StatusCellCallout currentChoice={props.task.Status} choices={props.statuses} onStatusChange={(status: string) => {
                    if (status === 'Finished' || status === 'Cancelled') {
                        if (props.task.Subtasks !== props.task.FinishedSubtasks) {
                            props.onError(`Not all subtasks are finished. Please close them first.`);
                            return hideCallout(calloutId);
                        }
                        if (status === 'Finished' && props.task.Subtasks === 0 && props.task.EffectiveTime === 0) {
                            props.onError('Effective time = 0. Some time should be registered first.');
                            return hideCallout(calloutId);
                        }
                        props.onStatusChange(status);
                    } else {
                        props.onStatusChange(status);
                    }
                    hideCallout(calloutId);
                }} />
            ),
        });
    }, [props.task, props.onStatusChange]);

    return (
        <span ref={pillRef}>
            <Pill
                onClick={handleClick}
                value={props.task.Status}
                disabled={props.disabled}
                className={`sp-cip-pill-${props.task.Status.toLowerCase().replace(/\s/g, '-')}`}
                style={{ lineHeight: '12px' }}
            />
            {props.calloutId ? null : <Callout id={CALLOUT_ID} />}
        </span>
    );
};
