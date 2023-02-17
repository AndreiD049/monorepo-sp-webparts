import * as React from 'react';
import {
    ActivityItem,
    Icon,
    IconButton,
    Link,
    Text,
} from 'office-ui-fabric-react';
import { GlobalContext } from '../utils/GlobalContext';
import MainService from '../services/main-service';
import { ITaskComment } from '@service/sp-cip/dist/models/ITaskComment';
import styles from './Comments.module.scss';
import { IComment } from 'sp-components/dist/editor';
import { CommentEditor } from '../components/CommentEditor';

export interface ICommentProps {
    comment: ITaskComment;
    onEdit: (id: number) => void;
}

interface ICommentHeaderProps {
    comment: ITaskComment;
    edit: boolean;
    setEdit: (val: boolean) => void;
}

const CommentHeader: React.FC<ICommentHeaderProps> = (props) => {
    const { currentUser } = React.useContext(GlobalContext);
    const user = props.comment.User || props.comment.Author;
    const isCurrentUserComment = user.Id === currentUser?.Id;
    const handleClick = async (): Promise<void> => {
        if (!props.edit && isCurrentUserComment) {
            props.setEdit(true);
        }
    };

    return (
        <div className={styles.commentsActivityDescription}>
            <div>
                <Link>{user.Title}</Link>
                <span key={2}> commented</span>
            </div>
            <div>
                {isCurrentUserComment && !props.edit && (
                    <IconButton
                        className={styles.commentsEditIcon}
                        iconProps={{
                            iconName: 'Edit',
                        }}
                        title={'Edit'}
                        onClick={handleClick}
                    />
                )}
            </div>
        </div>
    );
};

interface ICommentBodyProps {
    comment: ITaskComment;
    edit: boolean;
    setEdit: (val: boolean) => void;
    onEdit: (comment: IComment) => void;
}

const CommentBody: React.FC<ICommentBodyProps> = (props) => {
    const { currentUser, users } = React.useContext(GlobalContext);
    const user = props.comment.User || props.comment.Author;
    let content = <Text variant="medium">{props.comment.Comment}</Text>;

    if (props.edit && user.Id === currentUser?.Id) {
        content = (
            <CommentEditor
                users={users}
                onAddComment={(comment) => {
                    props.setEdit(false);
                    if (comment.text.trim() !== '') {
                        props.onEdit(comment);
                    }
                }}
                initialContent={props.comment.Comment}
            />
        );
    }

    return <div className={styles.commentsContent}>{content}</div>;
};

export const Comment: React.FC<ICommentProps> = (props) => {
    const { currentUser } = React.useContext(GlobalContext);
    const commentService = MainService.getCommentService();
    const taskService = MainService.getTaskService();
    const user = props.comment.User || props.comment.Author;
    const [edit, setEdit] = React.useState(false);

    const handleEdit = React.useCallback(async (comment: IComment) => {
        await commentService.editComment(props.comment.Id, {
            Comment: comment.text,
        });
        const task = await taskService.getTask(props.comment.ItemId);
        await commentService.sendCommentMessage({
            fromEmail: currentUser.Email,
            fromName: currentUser.Title,
            baseUrl: `${location.origin}${location.pathname}`,
            comment: comment.text,
            mentions: comment.mentions,
            task,
        });
        props.onEdit(props.comment.Id);
    }, []);

    const data = React.useMemo(
        () => ({
            key: props.comment.Id,
            activityDescription: [
                <CommentHeader
                    key={props.comment.Id}
                    comment={props.comment}
                    edit={edit}
                    setEdit={setEdit}
                />,
            ],
            activityIcon: (
                <Icon
                    iconName="Comment"
                    styles={{ root: { fontSize: '16px' } }}
                />
            ),
            activityPersonas: [
                {
                    imageUrl: `/_layouts/15/userphoto.aspx?accountname=${user.EMail}&Size=M`,
                },
            ],
            comments: (
                <CommentBody
                    comment={props.comment}
                    edit={edit}
                    setEdit={setEdit}
                    onEdit={handleEdit}
                />
            ),
            timeStamp: new Date(
                props.comment.Date || props.comment.Created
            ).toLocaleString(),
        }),
        [props.comment, edit]
    );

    return (
        <div className={styles.comments}>
            <ActivityItem
                styles={{
                    activityContent: {
                        width: '100%',
                    },
                }}
                key={data.key}
                activityPersonas={data.activityPersonas}
                activityDescription={data.activityDescription}
                comments={data.comments}
                timeStamp={data.timeStamp}
            />
        </div>
    );
};
