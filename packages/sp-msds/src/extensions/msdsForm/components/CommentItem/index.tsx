import {
    ActivityItem,
    IconButton,
    PersonaSize,
    Text,
} from '@fluentui/react';
import * as React from 'react';
import {
    FooterYesNo,
    hideDialog,
    hideSpinner,
    showDialog,
    showSpinner,
} from 'sp-components';
import { ICommentInfo, ISiteUserInfo } from 'sp-preset';
import { DIALOG_ID } from '../../constants';
import { ItemService } from '../../services/item-service';
import { COMMENT_SPINNER } from '../CommentSection';
import styles from './CommentItem.module.scss';

export interface ICommentItemProps {
    comment: ICommentInfo;
    setComments: React.Dispatch<React.SetStateAction<ICommentInfo[]>>;
    currentUser: ISiteUserInfo;
}

const CommentText: React.FC<ICommentItemProps> = (props) => {
    return (
        <div className={styles.commentText}>
            <Text variant="small">{props.comment.text}</Text>
        </div>
    );
};

const CommentTimeStamp: React.FC<ICommentItemProps> = (props) => {
    return (
        <Text variant="xSmall">
            {new Date(props.comment.createdDate).toLocaleString()}
        </Text>
    );
};

export const CommentItem: React.FC<ICommentItemProps> = (props) => {
    const isCurrentUser = React.useMemo(() => {
        if (props.currentUser && props.comment.author) {
            return (
                props.currentUser.Email.toLowerCase() ===
                props.comment.author.email.toLowerCase()
            );
        }
        return false;
    }, [props.currentUser, props.comment]);

    return (
        <div className={styles.container}>
            <ActivityItem
                activityDescription={
                    <Text variant="small">
                        {props.comment.author.name} commented
                    </Text>
                }
                activityPersonas={[
                    {
                        imageUrl: `/_layouts/15/userphoto.aspx?AccountName=${props.comment.author.email}&Size=M`,
                        size: PersonaSize.size32,
                    },
                ]}
                comments={<CommentText {...props} />}
                timeStamp={<CommentTimeStamp {...props} />}
            />
            {isCurrentUser && (
                <IconButton
                    className={styles.deleteIcon}
                    iconProps={{ iconName: 'Delete' }}
                    onClick={async () => {
                        showDialog({
                            id: DIALOG_ID,
                            dialogProps: {
                                title: 'Delete comment',
                                subText:
                                    'Comment will be deleted. Are you sure?',
                            },
                            footer: (
                                <FooterYesNo
                                    onNo={() => hideDialog(DIALOG_ID)}
                                    onYes={async () => {
                                        showSpinner(COMMENT_SPINNER);
                                        hideDialog(DIALOG_ID);
                                        await ItemService.deleteComment(
                                            props.comment.itemId,
                                            +props.comment.id
                                        );
                                        props.setComments((prev) => {
                                            hideSpinner(COMMENT_SPINNER);
                                            return prev.filter(
                                                (c) => c.id !== props.comment.id
                                            );
                                        });
                                    }}
                                />
                            ),
                        });
                    }}
                />
            )}
        </div>
    );
};
