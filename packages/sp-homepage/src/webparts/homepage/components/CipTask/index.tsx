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
import { ITaskOverview } from '@service/sp-cip/dist/models/ITaskOverview';

export interface ITaskCellProps {
    column: IColumn;
    node: TaskNode;

    // Title props
    open: boolean;
    level: number;

    onOpen: (open: boolean) => void;
    onTaskUpdated: (task: ITaskOverview) => void;
}

export const TaskCell: React.FC<ITaskCellProps> = (props) => {
    const { priorityChoices, statusChoices } = React.useContext(CipSectionContext);
    const task = props.node.getTask() as ITaskOverviewWithSource;
    const parent = props.node.getParent().getTask() as ITaskOverviewWithSource;
    let result = null;

    const handleNavigateToTask = React.useCallback(() => {
        window.open(
            `${task?.service.source.pageUrl}#/task/${task.Id}`,
            '_blank',
            'noreferrer=true'
        );
    }, []);

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
                    onClick={() => console.log('finish?')}
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
                        task={task}
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
                        status={task.Status}
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
                    dueDate={new Date(task.DueDate)}
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
    const [task, setTask] = React.useState(node.getTask() as ITaskOverviewWithSource);
    const [subtasks, setSubtasks] = React.useState<ITaskOverviewWithSource[]>([]);
    const [open, setOpen] = React.useState<boolean>(false);
    const [relink, relinkAllUnderMain] = useRelink(task.MainTaskId);

    // Fetch data from API
    React.useEffect(() => {
        async function run(): Promise<void> {
            if (!open) return null;
            if (subtasks.length > 0) return null;
            const resultSubtasks = (await task.service.getSubtasks(task)).map((t) =>
                convertTask(t, task.service)
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
                    node={node}
                    column={column}
                    open={open}
                    onOpen={handleOpen}
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
            return Array(task.Subtasks)
                .fill(1)
                .map((_t, idx) => (
                    <TaskShimmer
                        key={`${task.service.source.rootUrl}/${task.Id}/${idx}`}
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
