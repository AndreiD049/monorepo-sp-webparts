import { Icon, Text } from 'office-ui-fabric-react';
import * as React from 'react';
import { Pill } from '../../Pill';
import { CheckExpandButton } from '../CheckExpandButton';
import { ParentStroke } from '../ParentStroke';
import styles from './TitleCell.module.scss';
import { ITaskOverview } from '@service/sp-cip/dist/models/ITaskOverview';

export interface ITitleCellProps {
    task: ITaskOverview;
    parent: ITaskOverview | undefined;
    level: number;
    prevSiblingId: number | undefined;
    open: boolean;
    orphan: boolean;
    onDoubleClick?: () => void;
    onClick?: () => void;
    onToggleOpen?: (taskId: number, open: boolean) => void;

    style?: React.CSSProperties;
}

export const TitleCell: React.FC<ITitleCellProps> = ({ level = 0, style = {}, ...props }) => {
    const taskFinished = React.useMemo(() => Boolean(props.task.FinishDate), [props.task]);
    const disabled = Boolean(props.parent?.FinishDate);

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
                    finishedSubtasks={props.task.FinishedSubtasks}
                    totalSubtasks={props.task.Subtasks}
                    onClick={props.onClick || (() => null)}
                    onToggleOpen={props.onToggleOpen || (() => null)}
                    taskId={props.task.Id}
                    open={props.open}
                    taskFinished={taskFinished}
                    disabled={disabled}
                />
                <ParentStroke
                    taskId={props.task.Id}
                    parentId={props.parent?.Id}
                    prevSiblingId={props.prevSiblingId}
                />
            </div>
            {props.orphan && <Pill value="Subtask" className={styles.subtaskPill} />}
            <div className={styles.titleCell}>
                <Text
                    variant="medium"
                    block
                    className={`${styles.titleText} ${
                        taskFinished ? styles.titleTextFinished : ''
                    }`}
                    title={props.task.Title}
                >
                    {props.task.Title}
                </Text>
                <div className={styles.titleCountIcons}>
                    <div>
                        <Icon iconName="Comment" /> {props.task.CommentsCount}
                    </div>
                    <div>
                        <Icon iconName="Attach" /> {props.task.AttachmentsCount}
                    </div>
                </div>
            </div>
        </div>
    );
};
