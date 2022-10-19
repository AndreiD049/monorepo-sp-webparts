import { Icon, IconButton } from 'office-ui-fabric-react';
import * as React from 'react';
import styles from './CheckExpandButton.module.scss';

const SubtaskCounter: React.FC<{ subtasks: number, finishedSubtasks: number }> = ({ subtasks, finishedSubtasks }) => {
    return (
        <div className={styles.subtaskCounter}>
            <span>{finishedSubtasks}</span>
            <span className={styles.subtaskCounterDelimiter}>|</span>
            <span>{subtasks}</span>
        </div>
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
