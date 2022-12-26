import * as React from 'react';
import styles from './CipTask.module.scss';
import {
    ActionsCell,
    DueDateCell,
    FooterYesNo,
    hideDialog,
    hideSpinner,
    PriorityCell,
    showDialog,
    showSpinner,
    StatusCell,
    TaskShimmer,
    TimeLogGeneral,
    TitleCell,
    userToPersonaProps,
} from 'sp-components';
import { CALLOUT_ID, CIP_SPINNER_ID, DIALOG_ID } from '../../constants';
import { CipSectionContext } from '../../sections/CipSection/CipSectionContext';
import { DialogType, IColumn, IDetailsRowProps, MessageBarType } from 'office-ui-fabric-react';
import { ITaskOverviewWithSource } from '../../sections/CipSection';
import { TaskNode } from '@service/sp-cip';
import { convertTask } from './utils';
import { useRelink } from './useRelink';
import { tasksUpdated } from '../../sections/CipSection/useTasks';
import { SPnotify } from 'sp-react-notifications';
import { GlobalContext } from '../../context/GlobalContext';
import { getSourceKey } from '../../utils';
import { IAction } from '@service/sp-cip/dist/services/action-service';
import { dispatchSectionHandler } from '../Section/section-events';

export interface ITaskCellProps {
    column: IColumn;
    node: TaskNode;

    // Title props
    open: boolean;
    level: number;

    onOpen: (open: boolean) => void;
    onTaskUpdated?: (task: ITaskOverviewWithSource) => void;
}

export const TaskCell: React.FC<ITaskCellProps> = (props) => {
    const { currentUser } = React.useContext(GlobalContext);
    const { priorityChoices, statusChoices, siteUsers } = React.useContext(CipSectionContext);
    const task = React.useMemo(
        () => ({ ...props.node.getTask() } as ITaskOverviewWithSource),
        [props.node]
    );
    const parent = React.useMemo(
        () => ({ ...props.node.getParent().getTask() } as ITaskOverviewWithSource),
        [props.node]
    );
    const taskFinished = React.useMemo(() => Boolean(task.FinishDate), [task]);
    const sourceKey = React.useMemo(() => getSourceKey(task.service.source), [task]);
    // Get the user info on the particular site
    const currentSourceUser = React.useMemo(
        () => siteUsers[sourceKey]?.find((u) => u.LoginName === currentUser.LoginName),
        [currentUser, siteUsers]
    );
    let result = null;

    const handleNavigateToTask = React.useCallback(() => {
        window.open(
            `${task?.service.source.pageUrl}#/task/${task.Id}`,
            '_blank',
            'noreferrer=true'
        );
    }, []);

    // Clicking on the button next ot task title
    // If not all subtasks are completed, toggles expanding/collapsing
    // If task is finished, unfinish it
    // else - finish the task
    const handleTitleButtonClick = React.useCallback(async () => {
        const { taskService: service } = task.service;
        if (task.Subtasks !== task.FinishedSubtasks) {
            return props.onOpen(!props.open);
        }
        showSpinner(CIP_SPINNER_ID);
        if (taskFinished) {
            await service.reopenTask(task.Id);
            // Test
            if (props.onTaskUpdated) {
                const newTask = await service.getTask(task.Id);
                props.onTaskUpdated({ ...newTask, service: task.service });
            }
            hideSpinner(CIP_SPINNER_ID);
        } else {
            showDialog({
                id: DIALOG_ID,
                dialogProps: {
                    dialogContentProps: {
                        title: 'Finish task',
                        subText: 'Task will become finished. Are you sure?',
                    },
                    onDismiss: () => {
                        hideSpinner(CIP_SPINNER_ID);
                    }
                },
                footer: (
                    <FooterYesNo
                        onYes={async () => {
                            await service.finishTask(task.Id);
                            await task.service.actionService.addAction(
                                task.Id,
                                'Finished',
                                '',
                                currentSourceUser.Id,
                                new Date().toISOString()
                            );
                            hideDialog(DIALOG_ID);
                            // Test
                            if (props.onTaskUpdated) {
                                const newTask = await service.getTask(task.Id);
                                props.onTaskUpdated({ ...newTask, service: task.service });
                            }
                            hideSpinner(CIP_SPINNER_ID);
                        }}
                        onNo={() => {
                            hideDialog(DIALOG_ID);
                            hideSpinner(CIP_SPINNER_ID);
                        }}
                    />
                ),
            });
        }
    }, [task, props.open, taskFinished, currentSourceUser]);

    const handleStatusChange = React.useCallback(
        async (status: string) => {
            try {
                if (!currentSourceUser) {
                    SPnotify({
                        message: `User '${currentUser.Title}' is not member of this site.`,
                        messageType: MessageBarType.error,
                    });
                    return;
                }
                showSpinner(CIP_SPINNER_ID);
                const { taskService: service } = task.service;
                // Finish the task
                if (status === 'Finished' || status === 'Cancelled') {
                    await service.finishTask(task.Id, status);
                    await task.service.actionService.addAction(
                        task.Id,
                        'Finished',
                        '',
                        currentSourceUser.Id,
                        new Date().toISOString()
                    );
                    if (task.ParentId) {
                        const updatedParent = await service.getTask(task.ParentId);
                        tasksUpdated(convertTask(updatedParent, task.service));
                    }
                } else {
                    // Update task status
                    await service.updateTask(task.Id, {
                        Status: status,
                    });
                    await task.service.actionService.addAction(
                        task.Id,
                        'Status',
                        `${task.Status}|${status}`,
                        currentSourceUser.Id,
                        new Date().toISOString()
                    );
                }
                const updated = await service.getTask(task.Id);
                tasksUpdated(convertTask(updated, task.service));
                dispatchSectionHandler('Calendar', 'REFRESH');
            } finally {
                hideSpinner(CIP_SPINNER_ID);
            }
        },
        [task, currentSourceUser]
    );

    const handlePriorityChange = React.useCallback(
        async (prio: typeof task.Priority) => {
            try {
                if (!currentSourceUser) {
                    SPnotify({
                        message: `User '${currentUser.Title}' is not member of this site.`,
                        messageType: MessageBarType.error,
                    });
                    return;
                }
                showSpinner(CIP_SPINNER_ID);
                await task.service.taskService.updateTask(task.Id, {
                    Priority: prio,
                });
                await task.service.actionService.addAction(
                    task.Id,
                    'Priority',
                    `${task.Priority}|${prio}`,
                    currentSourceUser.Id,
                    new Date().toISOString()
                );
                const updated = await task.service.taskService.getTask(task.Id);
                tasksUpdated(convertTask(updated, task.service));
            } finally {
                hideSpinner(CIP_SPINNER_ID);
            }
        },
        [task, currentSourceUser]
    );

    const handleDueDateChange = React.useCallback(
        async (date: Date) => {
            try {
                if (!currentSourceUser) {
                    SPnotify({
                        message: `User '${currentUser.Title}' is not member of this site.`,
                        messageType: MessageBarType.error,
                    });
                    return;
                }
                showSpinner(CIP_SPINNER_ID);
                await task.service.taskService.updateTask(task.Id, {
                    DueDate: date.toISOString(),
                });
                await task.service.actionService.addAction(
                    task.Id,
                    'Due date',
                    `${task.DueDate}|${date.toISOString()}`,
                    currentSourceUser.Id,
                    new Date().toISOString()
                );
                const updated = await task.service.taskService.getTask(task.Id);
                tasksUpdated(convertTask(updated, task.service));
                dispatchSectionHandler('Calendar', 'REFRESH');
            } finally {
                hideSpinner(CIP_SPINNER_ID);
            }
        },
        [task, currentSourceUser]
    );

    const handleActionAdded = React.useCallback(
        async (action: Partial<IAction>) => {
            const { actionService } = task.service;
            await actionService.addAction(
                task.Id,
                'Time log',
                action.Comment,
                action.UserId,
                action.Date
            );
        },
        [task]
    );

    // Depending on column, render different cells
    switch (props.column.key) {
        case 'Title':
            result = (
                <TitleCell
                    task={task}
                    parent={parent}
                    level={props.level}
                    open={props.open}
                    orphan={props.node.isOrphan}
                    onToggleOpen={(_id: number, open: boolean) => props.onOpen(open)}
                    onClick={handleTitleButtonClick}
                    onDoubleClick={handleNavigateToTask}
                    prevSiblingId={props.node.getPreviousSibling()?.Id}
                    style={{
                        width: props.column.currentWidth,
                        padding: '0.5em 8px 0.5em 12px',
                    }}
                />
            );
            break;
        case 'Actions':
            result = (
                <ActionsCell
                    style={{
                        width: props.column.currentWidth,
                        padding: '0.5em 8px 0.5em 12px',
                    }}
                    items={[
                        {
                            name: 'logTime',
                            onClick: () =>
                                showDialog({
                                    id: DIALOG_ID,
                                    content: (
                                        <TimeLogGeneral
                                            task={task}
                                            disabled
                                            currentUserId={currentSourceUser?.Id}
                                            onActionAdd={handleActionAdded}
                                            onTaskEffectiveTimeChange={async (
                                                taskId: number,
                                                time: number
                                            ) => {
                                                const { taskService } = task.service;
                                                const latestTask = await taskService.getTask(
                                                    taskId
                                                );
                                                await taskService.updateTask(taskId, {
                                                    EffectiveTime: latestTask.EffectiveTime + time,
                                                });
                                            }}
                                            beforeActions={() => hideDialog(DIALOG_ID)}
                                            users={
                                                siteUsers[sourceKey]
                                                    ? userToPersonaProps(siteUsers[sourceKey])
                                                    : []
                                            }
                                        />
                                    ),
                                    dialogProps: {
                                        dialogContentProps: {
                                            type: DialogType.normal,
                                            title: 'Log time',
                                        },
                                        modalProps: {
                                            isBlocking: true,
                                        },
                                    },
                                    footer: null,
                                }),
                        },
                        {
                            name: 'navigate',
                            onClick: handleNavigateToTask,
                        },
                    ]}
                    disabled={taskFinished}
                />
            );
            break;
        case 'Priority':
            result = (
                <div
                    style={{
                        width: props.column.currentWidth,
                        padding: '0.5em 8px 0.5em 12px',
                    }}
                >
                    <PriorityCell
                        calloutId={CALLOUT_ID}
                        task={task}
                        choices={priorityChoices}
                        onChangePriority={handlePriorityChange}
                        disabled={taskFinished}
                    />
                </div>
            );
            break;
        case 'Status':
            result = (
                <div
                    style={{
                        width: props.column.currentWidth,
                        padding: '0.5em 8px 0.5em 12px',
                    }}
                >
                    <StatusCell
                        task={task}
                        onError={(err) =>
                            SPnotify({
                                message: err,
                                messageType: MessageBarType.error,
                            })
                        }
                        statuses={statusChoices}
                        onStatusChange={handleStatusChange}
                        calloutId={CALLOUT_ID}
                        disabled={taskFinished}
                    />
                </div>
            );
            break;
        case 'DueDate':
            result = (
                <DueDateCell
                    style={{
                        width: props.column.currentWidth,
                        padding: '0.5em 8px 0.5em 12px',
                    }}
                    dueDate={new Date(task.DueDate)}
                    calloutId={CALLOUT_ID}
                    onDateChange={handleDueDateChange}
                    disabled={taskFinished}
                />
            );
            break;
    }

    return result;
};

export interface ICipTaskProps {
    rowProps: IDetailsRowProps;
    level?: number;
}

export const CipTask: React.FC<ICipTaskProps> = ({ level = 0, ...props }) => {
    const node: TaskNode = props.rowProps.item;
    const task = React.useMemo(() => node.getTask() as ITaskOverviewWithSource, [node]);
    const [open, setOpen] = React.useState<boolean>(false);
    const [relink, relinkAllUnderMain] = useRelink(task.MainTaskId);

    // Fetch data from API
    React.useEffect(() => {
        async function run(): Promise<void> {
            if (!open) return null;
            if (node.getChildren().length > 0) return null;
            const resultSubtasks = (await task.service.getSubtasks(task)).map((t) =>
                convertTask(t, task.service)
            );
            tasksUpdated(...resultSubtasks);
        }
        run().catch((err) => console.error(err));
    }, [open]);

    const handleOpen = React.useCallback((open: boolean) => {
        setOpen(open);
        // After we set nore open, we also relink parent
        relinkAllUnderMain();
    }, []);

    // Render the whole row
    const body = React.useMemo(() => {
        const result: JSX.Element[] = [];
        props.rowProps.columns.forEach((column: IColumn) => {
            result.push(
                <TaskCell
                    key={node.Id}
                    level={level}
                    node={node}
                    column={column}
                    open={open}
                    onOpen={handleOpen}
                    onTaskUpdated={async (task: ITaskOverviewWithSource) => {
                        tasksUpdated(task);
                        if (task.ParentId) {
                            const service = task.service;
                            const taskService = service.taskService;
                            tasksUpdated(
                                convertTask(await taskService.getTask(task.ParentId), service)
                            );
                        }
                    }}
                />
            );
        });
        return result;
    }, [props, node, open, relink]);

    // Render the subtasks
    const renderSubtasks = React.useMemo(() => {
        if (open && node.getChildren().length === 0) {
            // task is expanded but the subtasks are not yet loaded
            // showing shimmers instead
            return Array(task.Subtasks)
                .fill(1)
                .map((_t, idx) => (
                    <TaskShimmer
                        key={`${task.service.source.rootUrl}/${task.Id}/${idx}`}
                        rowProps={props.rowProps}
                        parentNode={node}
                    />
                ));
        } else if (open && node.getChildren().length > 0) {
            // Now the subtasks are loaded
            // We can render them as well as redraw the link to
            // the parent task
            relinkAllUnderMain();
            return node.getChildren().map((node) => (
                <CipTask
                    key={`${(node.getTask() as ITaskOverviewWithSource).service.source.rootUrl}/${
                        node.Id
                    }`}
                    rowProps={{
                        ...props.rowProps,
                        item: node,
                    }}
                    level={level + 1}
                />
            ));
        }
        return null;
    }, [props.rowProps, open]);

    return (
        <div className={styles.container}>
            <div className={styles.row}>{body}</div>
            {open ? renderSubtasks : null}
        </div>
    );
};
