import {
    CommandBar,
    ICommandBarItemProps,
    Panel,
    PanelType,
    Pivot,
    PivotItem,
    Stack,
    StackItem,
    TextField,
} from 'office-ui-fabric-react';
import * as React from 'react';
import { useLocation, useNavigate, useParams } from 'react-router';
import { useSearchParams } from 'react-router-dom';
import { ActionLog } from '../../actionlog/ActionLog';
import { Attachments } from '../../attachments/Attachments';
import { useAttachments } from '../../attachments/useAttachments';
import { Comments } from '../../comments/Comments';
import { AlertDialog, getDialog } from '../../components/AlertDialog';
import {
    LoadingAnimation,
    loadingStart,
    loadingStop,
} from '../../components/utils/LoadingAnimation';
import { taskUpdated, taskUpdatedHandler } from '../../utils/dom-events';
import { LogTime } from '../dialogs/LogTime';
import { TaskNode } from '../graph/TaskNode';
import { ITaskOverview } from '../ITaskOverview';
import { useTasks } from '../useTasks';
import styles from './Panels.module.scss';

export interface ITaskDetailsProps {
    node: TaskNode;
    editable: boolean;
}

export const TaskDetails: React.FC = () => {
    const params = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams, setSearchParams] = useSearchParams();
    const state = location.state as { editable: boolean };
    const [task, setTask] = React.useState<ITaskOverview>(null);
    const { updateTask, getTask, attachmentsUpdated } = useTasks();
    const [editable, setEditable] = React.useState(Boolean(state?.editable));
    const { addAttachments } = useAttachments();
    const [editData, setEditData] = React.useState({
        title: task?.Title,
        description: task?.Description,
    });

    React.useEffect(() => {
        async function run() {
            loadingStart('details');
            const id = +params.taskId;
            if (Number.isInteger(id)) {
                const task = await getTask(id);
                setTask(task);
            }
            loadingStop('details');
        }
        run();
    }, [params]);

    React.useEffect(() => {
        setEditData({
            title: task?.Title,
            description: task?.Description,
        });
    }, [task]);

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
                    setEditable(false);
                },
            });
            items.push({
                key: 'cancel',
                text: 'Cancel',
                iconProps: {
                    iconName: 'ChromeClose',
                },
                onClick: () => {
                    setEditData({
                        title: task.Title,
                        description: task.Description,
                    });
                    setEditable(false);
                },
            });
        }
        items.push({
            key: 'time',
            text: 'Log time',
            iconProps: {
                iconName: 'Clock',
            },
            onClick: () =>
                getDialog({
                    alertId: 'DETAILS_PANEL',
                    title: 'Log time',
                    Component: <LogTime task={task} dialogId="DETAILS_PANEL" />,
                }),
        });
        return items;
    }, [editable, editData]);

    const handleDismiss = React.useCallback(() => {
        navigate('/');
    }, []);

    return (
        <Panel
            isLightDismiss
            isFooterAtBottom
            headerText="Task details"
            type={PanelType.medium}
            isOpen={true}
            onDismiss={handleDismiss}
        >
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
                {task && (
                    <Stack>
                        {editableInformation}
                        <Attachments
                            task={task}
                            onAttachments={async (files: File[]) => {
                                loadingStart('details');
                                await addAttachments(task, files);
                                const latest = await attachmentsUpdated(
                                    task.Id,
                                    files.length
                                );
                                taskUpdated(latest);
                                loadingStop('details');
                            }}
                        />
                        <StackItem style={{ marginTop: '1em' }}>
                            <Pivot
                                selectedKey={
                                    searchParams.get('tab') || 'general'
                                }
                                onLinkClick={(item) =>
                                    setSearchParams({ tab: item.props.itemKey })
                                }
                            >
                                <PivotItem
                                    headerText="General"
                                    itemKey="general"
                                >
                                    <Comments task={task} />
                                </PivotItem>
                                <PivotItem
                                    headerText="Action log"
                                    itemKey="actionlog"
                                >
                                    <ActionLog task={task} />
                                </PivotItem>
                            </Pivot>
                        </StackItem>
                    </Stack>
                )}
            </div>
            <AlertDialog alertId="DETAILS_PANEL" />
            <LoadingAnimation elementId="details" initialOpen />
        </Panel>
    );
};
