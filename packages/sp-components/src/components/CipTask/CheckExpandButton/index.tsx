import { Icon, IconButton } from '@fluentui/react';
import * as React from 'react';
import styles from './CheckExpandButton.module.scss';

const SubtaskCounter: React.FC<{ subtasks: number, finishedSubtasks: number }> = ({ subtasks, finishedSubtasks }) => {
    const radius = 47;
    const circumference = 2 * Math.PI * radius;
    const progress = finishedSubtasks / subtasks;
    const strokeDashoffset = circumference * (1 - progress);

    return (
        <svg viewBox="0 0 100 100" height="100%" style={{ overflow: 'visible' }}>
            <circle
                cx="50"
                cy="50"
                r={radius}
                fill="none"
                stroke="#ddd"
                strokeWidth="10"
                transform="rotate(-90 50 50)"
            />
            <circle
                cx="50"
                cy="50"
                r={radius}
                fill="none"
				className={styles.circle}
                strokeWidth="10"
                strokeDasharray={`${circumference} ${circumference}`}
                strokeDashoffset={strokeDashoffset}
                transform="rotate(-90 50 50)"
            />
            <text
                x="50"
                y="50"
                textAnchor="middle"
                dominantBaseline="central"
                fontWeight="bold"
                fontSize="2em"
            >
                {`${finishedSubtasks}/${subtasks}`}
            </text>
        </svg>
    );
};


export interface ICheckExpandButtonProps {
    // Props go here
    taskId: number;
    open?: boolean;
    disabled?: boolean;
    taskFinished?: boolean;
    totalSubtasks: number;
    finishedSubtasks: number;
    onToggleOpen: (taskId: number, open: boolean) => void;
    onClick: () => void;
}

export const CheckExpandButton: React.FC<ICheckExpandButtonProps> = (props) => {
    const button = React.useRef(null);

    const classNames: string = React.useMemo(() => {
        let result = styles.roundButton;
        if (!props.disabled && props.totalSubtasks === props.finishedSubtasks) {
            result += ` ${
                props.taskFinished
                    ? styles.roundButtonFinished
                    : styles.roundButtonOpen
            }`;
        }
        return result;
    }, [props.disabled, props.totalSubtasks, props.finishedSubtasks, props.taskFinished]);

    const content = React.useMemo(() => {
        if (props.totalSubtasks > 0 && props.finishedSubtasks !== props.totalSubtasks) {
            return <SubtaskCounter subtasks={props.totalSubtasks} finishedSubtasks={props.finishedSubtasks} />;
        } else {
            return (
                <Icon
                    iconName={`${props.taskFinished ? 'Cancel' : 'CheckMark'}`}
                />
            );
        }
    }, [props.finishedSubtasks, props.totalSubtasks, props.taskFinished]);

    const expandButton = React.useMemo(() => {
        if (props.totalSubtasks > 0) {
            return (
                <IconButton
                    onClick={() => props.onToggleOpen(props.taskId, !props.open)}
                    iconProps={{
                        iconName: `${props.open ? 'ChevronDown' : 'ChevronRight'}`,
                    }}
                />
            );
        }
        return null;
    }, [props.open]);

    return (
        <div
            className={`${styles.container} ${
                props.totalSubtasks > 0
                    ? ''
                    : styles.containerEmpty
            }`}
            onDoubleClick={(evt) => evt.stopPropagation()}
        >
            <button
                disabled={props.disabled}
                ref={button}
                id={`task-${props.taskId}`}
                data-taskid={props.taskId}
                onClick={props.onClick}
                className={classNames}
            >
                {content}
            </button>
            {expandButton}
            {/* {parentStroke} */}
        </div>
    );

};
