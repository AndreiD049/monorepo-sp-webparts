import { TaskNode } from '@service/sp-cip';
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
                    className={`sp-cip-pill-${choice.toLowerCase()}`}
                />
            ))}
        </div>
    );
};

export interface IStatusCellProps {
    status: string;
    statuses: string[];
    onStatusChange: (status: string) => void;

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
                <StatusCellCallout currentChoice={props.status} choices={props.statuses} onStatusChange={(status: string) => {
                    props.onStatusChange(status);
                    hideCallout(calloutId);
                }} />
            ),
        });
    }, []);

    return (
        <span ref={pillRef}>
            <Pill
                onClick={handleClick}
                value={props.status}
                disabled={props.disabled}
                className={`sp-cip-pill-${props.status.toLowerCase()}`}
            />
            {props.calloutId ? null : <Callout id={CALLOUT_ID} />}
        </span>
    );
};
