import {
    ActionButton,
    ActivityItem,
    Icon,
    IconButton,
    Link,
    Separator,
    Stack,
    StackItem,
    TextField,
} from 'office-ui-fabric-react';
import * as React from 'react';
import styles from './Comments.module.scss';
import { ITaskOverview } from '../tasks/ITaskOverview';
import { useComments } from './useComments';

interface ICommentsProps {
    task: ITaskOverview;
}

export const Comments: React.FC<ICommentsProps> = (props) => {
    const commentsAPI = useComments();
    const [newComment, setNewComment] = React.useState('');
    const [allLoaded, setAllLoaded] = React.useState(false);
    const [taskComments, setTaskComments] = React.useState([]);

    const onLoadMore = React.useCallback(async () => {
        const all = await commentsAPI.getByTask(props.task);
        setTaskComments(all);
        setAllLoaded(true);
    }, []);

    const handleNewComment = React.useCallback(async () => {
        if (!newComment.trim()) return;
        const added = await commentsAPI.addComment(props.task, newComment);
        setNewComment('');
        const synced = await commentsAPI.getComment(added.data.Id);
        console.log(synced);
        setTaskComments((prev) => [synced, ...prev]);
    }, [newComment]);

    React.useEffect(() => {
        commentsAPI.getByTask(props.task, 3, 0).then((c) => {
            setTaskComments(c);
            if (c.length < 3) {
                setAllLoaded(true);
            }
        });
    }, []);

    const data = React.useMemo(() => {
        return taskComments.map((comment) => ({
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
            comments: (
                <div className={styles['comments__content']}>
                    {comment.Comment}
                </div>
            ),
            timeStamp: new Date(comment.Created).toLocaleString(),
        }));
    }, [taskComments]);

    return (
        <div style={{ overflowX: 'hidden', wordBreak: 'break-all' }}>
            <Separator style={{ padding: '1em 0' }} />
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
                    />
                </StackItem>
                <IconButton
                    iconProps={{ iconName: 'Send' }}
                    onClick={handleNewComment}
                />
            </Stack>
            {data.map((item) => (
                <div className={styles.comments}>
                    <ActivityItem
                        key={item.key}
                        activityIcon={item.activityIcon}
                        activityDescription={item.activityDescription}
                        comments={item.comments}
                        timeStamp={item.timeStamp}
                    />
                </div>
            ))}
            {!allLoaded && taskComments.length >= 3 && (
                <ActionButton
                    iconProps={{ iconName: 'More' }}
                    onClick={onLoadMore}
                >
                    Load more
                </ActionButton>
            )}
        </div>
    );
};
