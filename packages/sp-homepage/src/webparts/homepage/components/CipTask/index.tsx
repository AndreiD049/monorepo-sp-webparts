import * as React from 'react';
import styles from './CipTask.module.scss';
import {
    ActionsCell,
    DueDateCell,
    hideDialog,
    PriorityCell,
    showDialog,
    StatusCell,
    TaskShimmer,
    TitleCell,
} from 'sp-components';
import { CALLOUT_ID, DIALOG_ID } from '../../constants';
import { CipSectionContext } from '../../sections/CipSection/CipSectionContext';
import { DialogType, IColumn, IDetailsRowProps, PrimaryButton } from 'office-ui-fabric-react';
import { ITaskOverviewWithSource } from '../../sections/CipSection';
import { TaskNode } from '@service/sp-cip';
import { convertTask } from './utils';
import { useRelink } from './useRelink';

export interface ITaskCellProps {
    column: IColumn;
    task: ITaskOverviewWithSource;

    // Title props
    open: boolean;
    onOpen: (open: boolean) => void;
    level: number;

    // stroke props
    prevSiblingId?: number;
}

export const TaskCell: React.FC<ITaskCellProps> = (props) => {
    const { priorityChoices, statusChoices } = React.useContext(CipSectionContext);
    let result = null;

    const handleNavigateToTask = React.useCallback(() => {
        window.open(
            `${props.task?.service.source.pageUrl}#/task/${props.task.Id}`,
            '_blank',
            'noreferrer=true'
        );
    }, []);

    // Depending on column, render different cells
    switch (props.column.key) {
        case 'Title':
            result = (
                <TitleCell
                    style={{
                        width: props.column.currentWidth,
                        padding: '0.5em 8px 0.5em 12px',
                    }}
                    level={props.level}
                    open={props.open}
                    onToggleOpen={(_id: number, open: boolean) => props.onOpen(open)}
                    onClick={() => console.log('finish?')}
                    onDoubleClick={handleNavigateToTask}
                    taskId={props.task.Id}
                    prevSiblingId={props.prevSiblingId}
                    parentId={props.task.ParentId}
                    title={props.task.Title}
                    comments={props.task.CommentsCount}
                    attachments={props.task.AttachmentsCount}
                    totalSubtasks={props.task.Subtasks}
                    finishedSubtasks={props.task.FinishedSubtasks}
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
                                    content: <div>test</div>,
                                    dialogProps: {
                                        dialogContentProps: {
                                            type: DialogType.normal,
                                            title: 'Hello world',
                                            subText: 'Do you want to test?',
                                        },
                                        modalProps: {
                                            isBlocking: true,
                                        },
                                    },
                                    footer: (
                                        <>
                                            <PrimaryButton onClick={() => hideDialog(DIALOG_ID)}>test</PrimaryButton>
                                        </>
                                    ),
                                }),
                        },
                        {
                            name: 'navigate',
                            onClick: handleNavigateToTask,
                        },
                    ]}
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
                        task={props.task}
                        choices={priorityChoices}
                        onChangePriority={(prio: string) => console.log(`new priority - ${prio}`)}
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
                        status={props.task.Status}
                        statuses={statusChoices}
                        onStatusChange={(status: string) => console.log(status)}
                        calloutId={CALLOUT_ID}
                    />
                </div>
            );
            break;
        case 'DueDate':
            result = (
                <DueDateCell
                    dueDate={new Date(props.task.DueDate)}
                    calloutId={CALLOUT_ID}
                    onDateChange={(date: Date) => console.log(date)}
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
    const item: ITaskOverviewWithSource = node.getTask() as ITaskOverviewWithSource;
    const [subtasks, setSubtasks] = React.useState<ITaskOverviewWithSource[]>([]);
    const [open, setOpen] = React.useState<boolean>(false);
    const [relink, relinkAllUnderMain] = useRelink(item.MainTaskId);

    // Fetch data from API
    React.useEffect(() => {
        async function run(): Promise<void> {
            if (!open) return null;
            if (subtasks.length > 0) return null;
            const resultSubtasks = (await item.service.getSubtasks(item)).map((t) =>
                convertTask(t, item.service)
            );
            node.withChildren(resultSubtasks);
            setSubtasks(resultSubtasks);
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
                    level={level}
                    task={item}
                    column={column}
                    open={open}
                    onOpen={handleOpen}
                    prevSiblingId={node.getPreviousSibling()?.Id}
                />
            );
        });
        return result;
    }, [props, open, relink]);

    // Render the subtasks
    const renderSubtasks = React.useMemo(() => {
        if (open && subtasks.length === 0) {
            // task is expanded but the subtasks are not yet loaded
            // showing shimmers instead
            return Array(item.Subtasks)
                .fill(1)
                .map((_t, idx) => (
                    <TaskShimmer
                        key={`${item.service.source.rootUrl}/${item.Id}/${idx}`}
                        rowProps={props.rowProps}
                        parentNode={node}
                    />
                ));
        } else if (open && subtasks.length > 0) {
            // Now the subtasks are loaded
            // We can render them as well as redraw the link to
            // the parent task
            relinkAllUnderMain();
            return subtasks.map((task) => (
                <CipTask
                    key={`${task.service.source.rootUrl}/${task.Id}`}
                    rowProps={{
                        ...props.rowProps,
                        item: node.getChildren().find((n) => n.Id === task.Id),
                    }}
                    level={level + 1}
                />
            ));
        }
        return null;
    }, [subtasks, props.rowProps, open]);

    return (
        <div className={styles.container}>
            <div className={styles.row}>{body}</div>
            {open ? renderSubtasks : null}
        </div>
    );
};
