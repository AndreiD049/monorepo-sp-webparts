import * as React from 'react';
import { Pill } from '../../Pill';
import { ITaskOverview } from '@service/sp-cip/dist/models/ITaskOverview';
import styles from './PriorityCell.module.scss';
import { Callout, hideCallout, showCallout } from '../../Callout';
import { DirectionalHint } from 'office-ui-fabric-react';

const CALLOUT_ID = 'sp-components-priority';

export interface IPriorityCellCalloutProps {
    choices: string[];
    currentChoice: string;
    handleClick: (choice: string) => void;
}

const PriorityCellCallout: React.FC<IPriorityCellCalloutProps> = (props) => {
    const choices = React.useMemo(() => {
        return props.choices.map((choice) => {
            const taskDisabled = props.currentChoice.toLowerCase() === choice.toLowerCase();
            return (
                <Pill
                    key={choice}
                    style={{
                        height: '100%',
                        width: '100px',
                        borderRadius: '5px',
                    }}
                    onClick={() => {
                        props.handleClick(choice);
                    }}
                    value={choice}
                    disabled={taskDisabled}
                    className={`sp-cip-pill-${choice.toLowerCase()}`}
                />
            );
        });
    }, [props]);

    return <div className={styles.text}>{choices}</div>;
};

export interface IPriorityCellProps {
    task: ITaskOverview;
    choices: string[];
    disabled?: boolean;
    calloutId?: string;
    onChangePriority: (priority: string) => void;

    className?: string;
    style?: React.CSSProperties;
}

export const PriorityCell: React.FC<IPriorityCellProps> = ({
    style = {},
    className = '',
    ...props
}) => {
    const containerRef = React.useRef(null);
    const calloutId = React.useMemo(() => (props.calloutId ? props.calloutId : `${CALLOUT_ID}/${props.task.Id}`), []);

    return (
        <div ref={containerRef} className={`${styles.container} ${className}`} style={style}>
            <Pill
                onClick={() =>
                    showCallout({
                        id: calloutId,
                        calloutProps: {
                            target: containerRef,
                            directionalHint: DirectionalHint.bottomCenter,
                        },
                        content: (
                            <PriorityCellCallout
                                choices={props.choices}
                                currentChoice={props.task.Priority}
                                handleClick={(choice) => {
                                    props.onChangePriority(choice);
                                    hideCallout(calloutId);
                                }}
                            />
                        ),
                    })
                }
                style={{
                    height: '100%',
                    width: '100%',
                    borderRadius: '5px',
                }}
                className={`sp-cip-pill-${props.task.Priority.toLowerCase()}`}
                value={props.task.Priority}
                disabled={props.disabled}
            />
            {props.calloutId ? null : <Callout id={calloutId} />}
        </div>
    );
};
