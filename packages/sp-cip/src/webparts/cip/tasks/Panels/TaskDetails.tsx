import {
    CommandBar,
    ICommandBarItemProps,
    Pivot,
    PivotItem,
    Stack,
    StackItem,
    TextField,
} from 'office-ui-fabric-react';
import * as React from 'react';
import { Attachments } from '../../attachments/Attachments';
import { Comments } from '../../comments/Comments';
import { getAlert } from '../../components/AlertDialog';
import { taskUpdated, taskUpdatedHandler } from '../../utils/dom-events';
import { TaskNode } from '../graph/TaskNode';
import { useTasks } from '../useTasks';
import styles from './Panels.module.scss';

export interface ITaskDetailsProps {
    node: TaskNode;
    editable: boolean;
}

export const TaskDetails: React.FC<ITaskDetailsProps> = (props) => {
    const [task, setTask] = React.useState(props.node.getTask());
    const { updateTask, getTask } = useTasks();
    const [editable, setEditable] = React.useState(Boolean(props.editable));
    const [editData, setEditData] = React.useState({
        title: task.Title,
        description: task.Description,
    });

    React.useEffect(() => {
        const removeHandler = taskUpdatedHandler((task) => setTask(task));
        return () => removeHandler();
    }, []);

    const editableInformation = !editable ? (
        <StackItem>
            <TextField
                label="Title"
                value={editData.title}
                borderless
                readOnly
            />
            <TextField
                label="Description"
                value={editData.description}
                readOnly
                borderless
                multiline
                resizable={false}
                autoAdjustHeight
                placeholder="-"
            />
        </StackItem>
    ) : (
        <StackItem>
            <TextField
                label="Title"
                value={editData.title}
                onChange={(_evt, value) =>
                    setEditData((prev) => ({
                        ...prev,
                        title: value,
                    }))
                }
            />
            <TextField
                label="Description"
                value={editData.description}
                multiline
                resizable={false}
                autoAdjustHeight
                placeholder="-"
                onChange={(_evt, value) =>
                    setEditData((prev) => ({
                        ...prev,
                        description: value,
                    }))
                }
            />
        </StackItem>
    );

    const commandItems = React.useMemo<ICommandBarItemProps[]>(() => {
        const items = [];
        if (!editable) {
            items.push({
                key: 'edit',
                text: 'Edit',
                iconProps: {
                    iconName: 'Edit',
                },
                onClick: () => setEditable(true),
            });
        } else {
            items.push({
                key: 'save',
                text: 'Save',
                iconProps: {
                    iconName: 'Save',
                },
                onClick: async () => {
                    await updateTask(task.Id, {
                        Title: editData.title,
                        Description: editData.description,
                    });
                    taskUpdated(await getTask(task.Id));
                    setEditable(false)
                },
            });
            items.push({
                key: 'cancel',
                text: 'Cancel',
                iconProps: {
                    iconName: 'ChromeClose'
                },
                onClick: () => {
                    setEditData({
                        title: task.Title,
                        description: task.Description,
                    });
                    setEditable(false)
                }
            })
        }
        items.push({
            key: 'time',
            text: 'Log time',
            iconProps: {
                iconName: 'Clock',
            },
            onClick:() => getAlert({
                title: 'Work in progress',
                subText: 'Work in progress',
                buttons: [{ key: 'ok', text: 'Ok' }]
            }),
        });
        return items;
    }, [editable, editData]);

    return (
        <div className={styles['details-panel']}>
            <CommandBar
                styles={{
                    root: {
                        paddingLeft: 0,
                        height: '2em',
                        marginBottom: '1em',
                    },
                }}
                items={commandItems}
            />
            <Stack>
                {editableInformation}
                <Attachments task={task} />
                <StackItem style={{ marginTop: '1em' }}>
                    <Pivot>
                        <PivotItem headerText="General">
                            <Comments task={task} />
                        </PivotItem>
                        <PivotItem headerText="Action log">Actions</PivotItem>
                    </Pivot>
                </StackItem>
            </Stack>
        </div>
    );
};
