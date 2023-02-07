import { Text } from 'office-ui-fabric-react';
import * as React from 'react';
import { ISiteUserInfo } from 'sp-preset';
import { LookupServiceCached } from '../../services/lookup-service';
import { CommentEditor } from '../CommentEditor';
import styles from './CommentSection.module.scss';

export interface ICommentSectionProps
    extends React.HTMLAttributes<HTMLDivElement> {
    // Props go here
}

export const CommentSection: React.FC<ICommentSectionProps> = (props) => {
    const [users, setUsers] = React.useState<ISiteUserInfo[]>([]);
    React.useEffect(() => {
        LookupServiceCached.getSiteUsers()
            .then((users) => setUsers(users.filter((u) => u.Email !== '')))
            .catch((err) => console.error(err));
    }, []);

    return (
        <div className={`${styles.container} ${props.className}`}>
            <Text variant="mediumPlus">Comments</Text>
            <CommentEditor users={users} onAddComment={(comment) => console.log(comment)} />
        </div>
    );
};
