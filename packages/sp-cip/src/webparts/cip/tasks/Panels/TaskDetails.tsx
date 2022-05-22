import {
    getRTLSafeKeyCode,
    Icon,
    IconButton,
    Link,
    Pivot,
    PivotItem,
    PrimaryButton,
    Separator,
    Stack,
    StackItem,
    Text,
    TextField,
} from 'office-ui-fabric-react';
import * as React from 'react';
import { IAttachment } from '../../attachments/IAttachment';
import { useAttachments } from '../../attachments/useAttachments';
import { ITaskComment } from '../../comments/ITaskComment';
import { useComments } from '../../comments/useComments';
import { FileInput } from '../../components/Utils/FileInput';
import { GlobalContext } from '../../utils/GlobalContext';
import { TaskNode } from '../graph/TaskNode';
import { useTasks } from '../useTasks';
import styles from './Panels.module.scss';

export interface ITaskDetailsProps {
    node: TaskNode;
}

const TaskGeneralDetails = (props: { node: TaskNode }) => {
    const { theme, properties } = React.useContext(GlobalContext);
    const task = React.useMemo(() => props.node.getTask(), [props.node]);
    const [description, setDescription] = React.useState(task.Description);
    const { updateTask, getTask } = useTasks();
    const {
        addAttachments,
        getAttachments,
        getAttachmentsRequest,
        removeAttachment,
    } = useAttachments();
    const comments = useComments();
    const [attachments, setAttachments] = React.useState<IAttachment[]>([]);
    const [comment, setComment] = React.useState('');
    const [taskComments, setTaskComments] = React.useState<ITaskComment[]>([]);

    const linkHref = React.useCallback((file: string) => {
        const url = getAttachmentsRequest(task).toRequestUrl();
        const re = /sharepoint.com(\/sites.*)\/_api/;
        const site = url.match(re)[1] || '';
        return `${site}/${properties.attachmentsPath}/Forms/AllItems.aspx?id=${site}/${properties.attachmentsPath}/${task.Id}/${file}&parent=${site}/${task.Id}`;
    }, []);

    React.useEffect(() => {
        comments.getByTask(task).then((c) => setTaskComments(c));
        getAttachments(task).then((r) => setAttachments(r));
    }, []);

    return (
        <div className={styles['details-panel']}>
            <Stack>
                <StackItem>
                    <TextField
                        label="Title"
                        value={task.Title}
                        readOnly
                        borderless
                    />
                    <TextField
                        label="Description"
                        value={task.Description}
                        readOnly
                        borderless
                        multiline
                        resizable={false}
                        autoAdjustHeight
                    />
                    <div
                        style={{
                            backgroundColor: theme.palette.themeLighterAlt,
                        }}
                    >
                        {attachments.map((a) => (
                            <div
                                style={{
                                    marginTop: '.4em',
                                    display: 'flex',
                                    flexFlow: 'row nowrap',
                                }}
                            >
                                <Icon iconName="PageLink" />{' '}
                                <Text
                                    variant="medium"
                                    style={{
                                        marginLeft: '.5em',
                                        maxWidth: '350px',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                    }}
                                >
                                    {' '}
                                    {a.Name}{' '}
                                </Text>
                                <span style={{ marginLeft: '.5em' }}>
                                    <Link
                                        data-interception="off"
                                        underline={false}
                                        target="_blank"
                                        href={linkHref(a.Name)}
                                    >
                                        <Icon
                                            iconName="RedEye"
                                            style={{ fontSize: '.85em' }}
                                        />
                                    </Link>
                                    <Link>
                                        <Icon
                                            iconName="Download"
                                            style={{ fontSize: '.85em' }}
                                        />
                                    </Link>
                                    <Link
                                        onClick={async () => {
                                            await removeAttachment(
                                                task,
                                                a.Name
                                            );
                                            setAttachments((prev) =>
                                                prev.filter(
                                                    (pa) => pa.Name !== a.Name
                                                )
                                            );
                                        }}
                                    >
                                        <Icon
                                            iconName="Delete"
                                            style={{ fontSize: '.85em' }}
                                        />
                                    </Link>
                                </span>
                            </div>
                        ))}
                        <FileInput
                            multiple
                            onFilesAdded={async (files) => {
                                await addAttachments(task, files);
                                setAttachments(await getAttachments(task));
                            }}
                        />
                    </div>
                </StackItem>
                <StackItem style={{ marginTop: '1em' }}>
                    <Text block variant="large">
                        Comments
                    </Text>

                    <TextField
                        multiline
                        value={comment}
                        onChange={(ev, val) => setComment(val)}
                        resizable={false}
                        autoAdjustHeight
                    />
                    <PrimaryButton
                        onClick={async () => {
                            await comments.addComment(task, comment);
                            setComment('');
                            setTaskComments(await comments.getByTask(task));
                        }}
                        style={{ marginTop: '.5em' }}
                    >
                        Save
                    </PrimaryButton>
                    <Separator />
                    {
                        taskComments.map((c) => (
                            <div style={{
                                backgroundColor: theme.palette.neutralLighter,
                                boxShadow: theme.effects.elevation4,
                                padding: '.2em .3em',
                                marginTop: '.3em',
                            }}>
                                {c.Author.Title} wrote at {c.Created}: <br/>
                                <p>{c.Comment}</p>
                            </div>
                        ))
                    }
                </StackItem>
            </Stack>
        </div>
    );
};

export const TaskDetails: React.FC<ITaskDetailsProps> = (props) => {
    return (
        <div>
            <Pivot>
                <PivotItem headerText="General">
                    <TaskGeneralDetails node={props.node} />
                </PivotItem>
                <PivotItem headerText="Action log">Actions</PivotItem>
            </Pivot>
        </div>
    );
};
