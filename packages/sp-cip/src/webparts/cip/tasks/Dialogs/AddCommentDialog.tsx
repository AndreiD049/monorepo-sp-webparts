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
import { useComments } from '../../comments/useComments';
import { dismissDialog } from '../../components/AlertDialog';
import { ITaskOverview } from '../ITaskOverview';
import styles from '../../comments/Comments.module.scss';

export const AddCommentDialog: React.FC<{ task: ITaskOverview }> = (props) => {
    const { getByTask, addComment, getComment } = useComments();
    const [newComment, setNewComment] = React.useState('');
    const [comments, setComments] = React.useState([]);

    React.useEffect(() => {
        getByTask(props.task, 3, 0).then((c) => {
            setComments(c);
        });
    }, [props.task]);

    const data = React.useMemo(() => {
        return comments.map((comment) => ({
            key: comment.Id,
            activityDescription: [
                <Link>{comment.Author.Title}</Link>,
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
                <div className={styles['comments__content']}>
                    {comment.Comment}
                </div>
            ),
            timeStamp: new Date(comment.Created).toLocaleString(),
        }));
    }, [comments]);

    const handleNewComment = React.useCallback(async () => {
        if (!newComment.trim()) return;
        await addComment(props.task, newComment);
        dismissDialog('MAIN');
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
                            <div className={styles.comments}>
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
