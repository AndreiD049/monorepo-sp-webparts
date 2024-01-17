import { Stack, Text } from '@fluentui/react';
import * as React from 'react';
import { hideSpinner, LoadingSpinner, showSpinner } from 'sp-components';
import { ICommentInfo, ISiteUserInfo } from 'sp-preset';
import { ItemService } from '../../services/item-service';
import { LookupServiceCached } from '../../services/lookup-service';
import { CommentItem } from '../CommentItem';
import { CommentEditor } from 'sp-components/dist/editor';
import styles from './CommentSection.module.scss';
import { IMSDSRequest } from '../../services/IMSDSRequest';

export const COMMENT_SPINNER = 'sp-msds/comment-spinner';

export interface ICommentSectionProps
    extends React.HTMLAttributes<HTMLDivElement> {
    item: IMSDSRequest;
    currentUser: ISiteUserInfo;
}

export const CommentSection: React.FC<ICommentSectionProps> = (props) => {
    const [comments, setComments] = React.useState<ICommentInfo[]>([]);
    const [users, setUsers] = React.useState<ISiteUserInfo[]>([]);
    React.useEffect(() => {
        showSpinner(COMMENT_SPINNER);
        ItemService.getComments(props.item.Id)
            .then((comments) => {
                setComments(comments as unknown as ICommentInfo[]);
                hideSpinner(COMMENT_SPINNER);
            })
            .catch((err) => console.error(err));
        LookupServiceCached.getSiteUsers()
            .then((users: ISiteUserInfo[]) => setUsers(users.filter((u) => u.Email !== '')))
            .catch((err: Error) => console.error(err));
    }, []);

    return (
        <div className={`${styles.container} ${props.className}`}>
            <LoadingSpinner id={COMMENT_SPINNER} type="absolute" />
            <Text variant="mediumPlus">Comments</Text>
            <CommentEditor
                users={users}
                onAddComment={async (comment: { text: string, mentions: ICommentInfo['mentions'] }) => {
                    showSpinner(COMMENT_SPINNER);
                    const added = await ItemService.addComment(props.item.Id, {
                        text: comment.text,
                        mentions: comment.mentions,
                    });
                    setComments((prev) => {
                        hideSpinner(COMMENT_SPINNER);
                        return [added, ...prev];
                    });
                }}
            />
            <Stack>
                {comments.map((c) => (
                    <CommentItem key={c.id} comment={c} setComments={setComments} currentUser={props.currentUser} />
                ))}
            </Stack>
        </div>
    );
};
