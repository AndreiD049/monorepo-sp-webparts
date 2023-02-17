import {
    ActionButton,
    Separator,
} from 'office-ui-fabric-react';
import { IComment } from 'sp-components/dist/editor';
import * as React from 'react';
import { Comment } from './Comment';
import MainService from '../services/main-service';
import { taskUpdated } from '../utils/dom-events';
import { ITaskOverview } from '@service/sp-cip/dist/models/ITaskOverview';
import { IPagedCollection } from '@service/sp-cip/dist/services/comment-service';
import { GlobalContext } from '../utils/GlobalContext';
import { ITaskComment } from '@service/sp-cip/dist/models/ITaskComment';
import styles from './Comments.module.scss';
import { CommentEditor } from '../components/CommentEditor';

interface ICommentsProps {
    task: ITaskOverview;
}


export const Comments: React.FC<ICommentsProps> = (props) => {
    const { currentUser, users } = React.useContext(GlobalContext);
    const commentService = MainService.getCommentService();
    const taskService = MainService.getTaskService();
    const [taskComments, setTaskComments] = React.useState<ITaskComment[]>([]);
    const [commentPager, setCommentPager] = React.useState<IPagedCollection<ITaskComment[]>>(null);

    const onLoadMore = React.useCallback(async () => {
        if (commentPager?.hasNext) {
            const nextPager = await commentPager.getNext();
            setTaskComments((prev) => [...prev, ...nextPager.results]);
            setCommentPager(nextPager);
        }
    }, [commentPager]);

    const handleNewComment = React.useCallback(async (comment: IComment) => {
        if (!comment.text.trim()) return;
        const added = await commentService.addComment(props.task, comment.text, currentUser.Id, new Date().toISOString());
        await commentService.sendCommentMessage({
            fromEmail: currentUser.Email,
            fromName: currentUser.Title,
            baseUrl: `${location.origin}${location.pathname}`,
            comment: comment.text,
            mentions: comment.mentions,
            task: props.task,
        });
        taskUpdated(await taskService.getTask(props.task.Id));
        const synced = await commentService.getComment(added.data.Id);
        setTaskComments((prev) => [synced, ...prev]);
    }, []);

    const handleEditComment = async (id: number): Promise<void> => {
        const updated = await commentService.getComment(id);
        setTaskComments((prev) => prev.map((p) => p.Id === id ? updated : p));
    }

    React.useEffect(() => {
        commentService.getByTaskPaged(props.task, 5).then((p) => {
            setTaskComments(p.results);
            setCommentPager(p)
        }).catch((err) => console.log(err));
    }, []);

    return (
        <div style={{ overflowX: 'hidden', wordBreak: 'break-all' }}>
            <Separator style={{ padding: '1em 0' }} />
            <div className={styles.commentEditor}>
                <CommentEditor users={users} onAddComment={handleNewComment} />
            </div>
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
