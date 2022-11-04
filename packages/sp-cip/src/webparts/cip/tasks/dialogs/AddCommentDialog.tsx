import {
    ActivityItem,
    Icon,
    IconButton,
    Link,
    Stack,
    StackItem,
    Text,
    TextField,
} from 'office-ui-fabric-react';
import * as React from 'react';
import styles from '../../comments/Comments.module.scss';
import MainService from '../../services/main-service';
import { taskUpdated } from '../../utils/dom-events';
import { ITaskOverview } from '@service/sp-cip/dist/models/ITaskOverview';
import { GlobalContext } from '../../utils/GlobalContext';

export interface IAddCommentDialogProps {
    task: ITaskOverview;
    onAfterComment?: () => void;
}

export const AddCommentDialog: React.FC<IAddCommentDialogProps> = (props) => {
    const { currentUser } = React.useContext(GlobalContext);
    const commentService = MainService.getCommentService();
    const taskService = MainService.getTaskService();
    const [newComment, setNewComment] = React.useState('');
    const [comments, setComments] = React.useState([]);

    React.useEffect(() => {
        commentService.getByTask(props.task, 3, 0).then((c) => {
            setComments(c);
        }).catch((err) => console.error(err));
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
                <div className={styles.comments__content}>
                    {comment.Comment}
                </div>
            ),
            timeStamp: new Date(comment.Created).toLocaleString(),
        }));
    }, [comments]);

    const handleNewComment = React.useCallback(async () => {
        if (!newComment.trim()) return;
        await commentService.addComment(props.task, newComment, currentUser.Id, new Date().toISOString());
        taskUpdated(await taskService.getTask(props.task.Id));
        if (props.onAfterComment) { 
            props.onAfterComment();
        }
    }, [newComment]);

    return (
        <div style={{ width: 400 }}>
            <Stack
                horizontal
                horizontalAlign="stretch"
                verticalAlign="center"
                styles={{ root: { marginBottom: '1em' } }}
            >
                <StackItem grow={1}>
                    <TextField
                        value={newComment}
                        multiline
                        resizable={false}
                        autoAdjustHeight
                        onChange={(evt, val) => setNewComment(val)}
                        placeholder="Add comment"
                    />
                </StackItem>
                <IconButton
                    iconProps={{ iconName: 'Send' }}
                    onClick={handleNewComment}
                />
            </Stack>
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
