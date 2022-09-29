import * as React from 'react';
import styles from './Comments.module.scss';
import {
    ActivityItem,
    Icon,
    IconButton,
    Link,
    Text,
    TextField,
} from 'office-ui-fabric-react';
import { GlobalContext } from '../utils/GlobalContext';
import MainService from '../services/main-service';
import { ITaskComment } from '@service/sp-cip/dist/models/ITaskComment';

export interface ICommentProps {
    comment: ITaskComment;
    onEdit: (id: number) => void;
}

interface ICommentHeaderProps {
    comment: ITaskComment;
    edit: boolean;
    setEdit: (val: boolean) => void;
    onEdit: () => void;
}

const CommentHeader: React.FC<ICommentHeaderProps> = (props) => {
    const { currentUser } = React.useContext(GlobalContext);
    const user = props.comment.User || props.comment.Author;
    const isCurrentUserComment = user.Id === currentUser?.Id;
    const handleClick = async () => {
        if (props.edit && isCurrentUserComment) {
            await props.onEdit();
            props.setEdit(false);
        } else {
            props.setEdit(true);
        }
    };

    return (
        <div className={styles['comments__activity-description']}>
            <div>
                <Link>{user.Title}</Link>
                <span key={2}> commented</span>
            </div>
            <div>
                {isCurrentUserComment && (
                    <IconButton
                        className={styles['comments__edit-icon']}
                        iconProps={{
                            iconName: props.edit ? 'CheckMark' : 'Edit',
                        }}
                        title={props.edit ? 'Save' : 'Edit'}
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
    newValue: string;
    setNewValue: (val: string) => void;
}

const CommentBody: React.FC<ICommentBodyProps> = (props) => {
    const { currentUser } = React.useContext(GlobalContext);
    const user = props.comment.User || props.comment.Author;
    let content = <Text variant="medium">{props.newValue}</Text>;

    if (props.edit && user.Id === currentUser?.Id) {
        content = (
            <TextField
                multiline
                value={props.newValue}
                onChange={(_e: any, newValue: string) =>
                    props.setNewValue(newValue)
                }
                autoAdjustHeight
                resizable={false}
            />
        );
    }

    return <div className={styles['comments__content']}>{content}</div>;
};

export const Comment: React.FC<ICommentProps> = (props) => {
    const commentService = MainService.getCommentService();
    const user = props.comment.User || props.comment.Author;
    const [edit, setEdit] = React.useState(false);
    const [newValue, setNewValue] = React.useState(props.comment.Comment);

    const handleEdit = React.useCallback(async () => {
        await commentService.editComment(props.comment.Id, {
            Comment: newValue,
        });
        props.onEdit(props.comment.Id);
    }, [newValue]);

    const data = React.useMemo(
        () => ({
            key: props.comment.Id,
            activityDescription: [
                <CommentHeader
                    comment={props.comment}
                    edit={edit}
                    setEdit={setEdit}
                    onEdit={handleEdit}
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
                    newValue={newValue}
                    setNewValue={setNewValue}
                    edit={edit}
                    setEdit={setEdit}
                />
            ),
            timeStamp: new Date(props.comment.Created).toLocaleString(),
        }),
        [props.comment, edit, newValue]
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
