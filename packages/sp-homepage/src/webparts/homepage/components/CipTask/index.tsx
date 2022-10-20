import * as React from 'react';
import { IDetailsRowProps, IColumn } from 'office-ui-fabric-react';
import { ITaskOverviewWithSource } from '../../sections/CipSection';
import { TitleCell, ActionsCell, PriorityCell, DueDateCell, TaskShimmer } from 'sp-components';
import { TaskNode } from '@service/sp-cip';
import { CALLOUT_ID, RELINK_EVT } from '../../constants';
import { convertTask } from './utils';
import styles from './CipTask.module.scss';

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
    let result = null;
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
                    onToggleOpen={(id: number, open: boolean) => props.onOpen(open)}
                    onClick={() => console.log('finish?')}
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
                            onClick: () => console.log('Logging time'),
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
                        choices={['None', 'Low', 'Medium', 'High']}
                        onChangePriority={(prio: string) => console.log(`new priority - ${prio}`)}
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
    const evtName = `${RELINK_EVT}/${item.MainTaskId}`;
    const [subtasks, setSubtasks] = React.useState<ITaskOverviewWithSource[]>([]);
    const [open, setOpen] = React.useState<boolean>(false);
    const [relink, setRelink] = React.useState<boolean>(false);

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
        setTimeout(() => {
            document.dispatchEvent(new CustomEvent(evtName));
        }, 0);
    }, []);

    // Handle Relinking parent with ParentStroke
    React.useEffect(() => {
        function handler(evt: CustomEvent): void {
            setRelink((prev) => !prev);
        }
        document.addEventListener(evtName, handler);
        return () => document.removeEventListener(evtName, handler);
    }, [evtName]);

    const renderSubtasks = React.useMemo(() => {
        if (open && subtasks.length === 0) {
            return Array(item.Subtasks)
                .fill(1)
                .map((_t, idx) => (
                    <TaskShimmer
                        key={`${item.service.source.rootUrl}/${item.Id}/${idx}`}
                        rowProps={props.rowProps}
                        parentNode={node}
                    />
                ));
        } else if (subtasks.length > 0) {
            setTimeout(() => {
                document.dispatchEvent(new CustomEvent(evtName));
            }, 0);
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
    }, [props.rowProps, open, relink]);

    return (
        <div className={styles.container}>
            <div className={styles.row}>{body}</div>
            {open ? renderSubtasks : null}
        </div>
    );
};
