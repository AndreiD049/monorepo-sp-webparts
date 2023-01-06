import { IAction } from '@service/sp-cip/dist/services/action-service';
import * as React from 'react';
import { getActionComment } from '../../../../actionlog/ActionLogItem';
import styles from './CommentCell.module.scss';

export interface ICommentCellProps {
    action: IAction;
}

export const CommentCell: React.FC<ICommentCellProps> = (props) => {
    return <div className={styles.container}>{getActionComment(props.action)}</div>;
};
