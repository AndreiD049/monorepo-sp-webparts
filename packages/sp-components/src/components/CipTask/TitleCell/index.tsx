import { Icon, Text } from 'office-ui-fabric-react';
import * as React from 'react';
import { Pill } from '../../Pill';
import { CheckExpandButton } from '../CheckExpandButton';
import { ParentStroke } from '../ParentStroke';
import styles from './TitleCell.module.scss';

export interface ITitleCellProps {
    taskId: number;
    title: string;
    comments: number;
    attachments: number;
    orphan?: boolean;
    level?: number;

    // stroke props
    parentId?: number;
    prevSiblingId?: number;

    totalSubtasks: number;
    finishedSubtasks: number;
    open?: boolean;
    buttonDisabled?: boolean;
    taskFinished?: boolean;

    onDoubleClick?: () => void;
    onClick?: () => void;
    onToggleOpen?: (taskId: number, open: boolean) => void;

    style?: React.CSSProperties;
}

export const TitleCell: React.FC<ITitleCellProps> = ({ level = 0, style = {}, ...props }) => {
    return (
        <div
            style={style}
            className={styles.container}
            data-type="row"
            itemType="button"
            onDoubleClick={props.onDoubleClick || (() => null)}
        >
            <div
                style={{
                    marginLeft: 30 * level,
                    position: 'relative',
                }}
            >
                <CheckExpandButton
                    finishedSubtasks={props.finishedSubtasks}
                    totalSubtasks={props.totalSubtasks}
                    onClick={props.onClick || (() => null)}
                    onToggleOpen={props.onToggleOpen || (() => null)}
                    taskId={props.taskId}
                    open={props.open}
                    taskFinished={props.taskFinished}
                    disabled={props.buttonDisabled}
                />
                <ParentStroke
                    taskId={props.taskId}
                    parentId={props.parentId}
                    prevSiblingId={props.prevSiblingId}
                />
            </div>
            {props.orphan && <Pill value="Subtask" />}
            <div className={styles.titleCell}>
                <Text
                    variant="medium"
                    block
                    className={`${styles.titleText} ${
                        props.taskFinished ? styles.titleTextFinished : ''
                    }`}
                    title={props.title}
                >
                    {props.title}
                </Text>
                <div className={styles.titleCountIcons}>
                    <div>
                        <Icon iconName="Comment" /> {props.comments}
                    </div>
                    <div>
                        <Icon iconName="Attach" /> {props.attachments}
                    </div>
                </div>
            </div>
        </div>
    );
};
