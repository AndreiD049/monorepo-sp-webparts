import { ActivityItem, Icon, Link, Stack, Text } from 'office-ui-fabric-react';
import * as React from 'react';
import styles from '../../comments/Comments.module.scss';
import MainService from '../../services/main-service';
import { taskUpdated } from '../../utils/dom-events';
import { ITaskOverview } from '@service/sp-cip/dist/models/ITaskOverview';
import { GlobalContext } from '../../utils/GlobalContext';
import { IComment } from 'sp-components/dist/editor';
import { CommentEditor } from '../../components/CommentEditor';

export interface IAddCommentDialogProps {
    task: ITaskOverview;
    onAfterComment?: () => void;
}

export const AddCommentDialog: React.FC<IAddCommentDialogProps> = (props) => {
    const { currentUser, users } = React.useContext(GlobalContext);
    const commentService = MainService.getCommentService();
    const taskService = MainService.getTaskService();
    const [comments, setComments] = React.useState([]);

    React.useEffect(() => {
        commentService
            .getByTask(props.task, 3, 0)
            .then((c) => {
                setComments(c);
            })
            .catch((err) => console.error(err));
    }, [props.task]);

    const data = React.useMemo(() => {
        return comments.map((comment) => ({
            key: comment.Id,
            activityDescription: [
                <Link key={comment.Id}>{comment.Author.Title}</Link>,
                <span key={2}> commented</span>,
            ],
            activityIcon: (
                <Icon
                    iconName="Comment"
                    styles={{ root: { fontSize: '16px' } }}
                />
            ),
            activityPersonas: [
                {
                    imageUrl: `/_layouts/15/userphoto.aspx?accountname=${comment.Author.EMail}&Size=M`,
                },
            ],
            comments: (
                <div className={styles.commentsContent}>{comment.Comment}</div>
            ),
            timeStamp: new Date(comment.Created).toLocaleString(),
        }));
    }, [comments]);

    const handleNewComment = React.useCallback(async (comment: IComment) => {
        if (!comment.text.trim()) return;
        await commentService.addComment(
            props.task,
            comment.text,
            currentUser.Id,
            new Date().toISOString()
        );
        await commentService.sendCommentMessage({
            fromEmail: currentUser.Email,
            fromName: currentUser.Title,
            baseUrl: `${location.origin}${location.pathname}`,
            comment: comment.text,
            mentions: comment.mentions,
            task: props.task,
        });
        taskUpdated(await taskService.getTask(props.task.Id));
        if (props.onAfterComment) {
            props.onAfterComment();
        }
    }, []);

    return (
        <div style={{ width: 400 }}>
            <div className={styles.commentEditor}>
                <CommentEditor users={users} onAddComment={handleNewComment} clearAfterInsert={false} />
            </div>
            {comments.length > 0 && (
                <Stack>
                    <Text
                        styles={{ root: { paddingBottom: '1em' } }}
                        block
                        variant="large"
                    >
                        Last 3 comments:
                    </Text>
                    {data.map((comment) => {
                        return (
                            <div key={comment.key} className={styles.comments}>
                                <ActivityItem
                                    key={comment.key}
                                    activityPersonas={comment.activityPersonas}
                                    activityDescription={
                                        comment.activityDescription
                                    }
                                    comments={comment.comments}
                                    timeStamp={comment.timeStamp}
                                />
                            </div>
                        );
                    })}
                </Stack>
            )}
        </div>
    );
};
