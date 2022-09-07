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
import { IPagedCollection } from '../services/comment-service';
import { ITaskComment } from './ITaskComment';
import { Comment } from './Comment';
import MainService from '../services/main-service';
import { taskUpdated } from '../utils/dom-events';
import { ITaskOverview } from '@service/sp-cip/dist/models/ITaskOverview';

interface ICommentsProps {
    task: ITaskOverview;
}

export const Comments: React.FC<ICommentsProps> = (props) => {
    const commentService = MainService.getCommentService();
    const taskService = MainService.getTaskService();
    const [newComment, setNewComment] = React.useState('');
    const [taskComments, setTaskComments] = React.useState<ITaskComment[]>([]);
    const [commentPager, setCommentPager] = React.useState<IPagedCollection<ITaskComment[]>>(null);

    const onLoadMore = React.useCallback(async () => {
        if (commentPager?.hasNext) {
            const nextPager = await commentPager.getNext();
            setTaskComments((prev) => [...prev, ...nextPager.results]);
            setCommentPager(nextPager);
        }
    }, [commentPager]);

    const handleNewComment = React.useCallback(async () => {
        if (!newComment.trim()) return;
        const added = await commentService.addComment(props.task, newComment);
        taskUpdated(await taskService.getTask(props.task.Id));
        setNewComment('');
        const synced = await commentService.getComment(added.data.Id);
        setTaskComments((prev) => [synced, ...prev]);
    }, [newComment]);

    const handleEditComment = async (id: number) => {
        const updated = await commentService.getComment(id);
        setTaskComments((prev) => prev.map((p) => p.Id === id ? updated : p));
    }

    React.useEffect(() => {
        commentService.getByTaskPaged(props.task, 5).then((p) => {
            setTaskComments(p.results);
            setCommentPager(p)
        });
    }, []);

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
                        placeholder="Add comment"
                    />
                </StackItem>
                <IconButton
                    iconProps={{ iconName: 'Send' }}
                    onClick={handleNewComment}
                />
            </Stack>
            {taskComments.map((comment) => (
                <Comment key={comment.Id} comment={comment} onEdit={handleEditComment} />
            ))}
            {commentPager?.hasNext && (
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
