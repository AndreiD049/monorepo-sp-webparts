import { cloneDeep } from '@microsoft/sp-lodash-subset';
import { slice, wrap } from 'lodash';
import { DateTime } from 'luxon';
import { DefaultButton, PrimaryButton, Separator } from 'office-ui-fabric-react';
import * as React from 'react';
import { closePanel, setPanelProperties } from '../../../hooks/usePanel';
import { useTasks } from '../../../hooks/useTasks';
import ITask, { TaskType } from '../../../models/ITask';
import GlobalContext from '../../../utils/GlobalContext';
import Task from '../Task';

export interface IEditTasksProps {
    taskId: number;
}

interface ITaskWrapper {
    item: ITask;
    editable: boolean;
    status: TaskStatus;
}

type TaskStatus = 'new' | 'updated' | 'original' | 'deleted';

const EditTaskDetail: React.FC<{
    wrapper: ITaskWrapper;
    onSplit: () => void;
    onUpdate: (wrapper: ITaskWrapper) => void;
}> = (props) => {
    if (props.wrapper.status === 'deleted') return null;

    const activeFrom = React.useMemo(() => {
        if (props.wrapper.editable) {
            return (
                <input
                    onChange={(ev) => {
                        const clone = cloneDeep(props.wrapper);
                        clone.status = nextStatus(clone.status);
                        clone.item.ActiveFrom = ev.target.value;
                        props.onUpdate(clone);
                    }}
                    value={props.wrapper.item.ActiveFrom}
                    style={{ width: '100px' }}
                />
            );
        }
        return props.wrapper.item.ActiveFrom;
    }, [props.wrapper.item, props.wrapper.editable]);

    const activeTo = React.useMemo(() => {
        if (props.wrapper.editable) {
            return (
                <input
                    onChange={(ev) => {
                        const clone = cloneDeep(props.wrapper);
                        clone.status = nextStatus(clone.status);
                        clone.item.ActiveTo = ev.target.value;
                        props.onUpdate(clone);
                    }}
                    value={props.wrapper.item.ActiveTo}
                    style={{ width: '100px' }}
                />
            );
        }
        return props.wrapper.item.ActiveTo;
    }, [props.wrapper.item, props.wrapper.editable]);

    const title = React.useMemo(() => {
        if (props.wrapper.editable) {
            return (
                <input
                    onChange={(ev) => {
                        const clone = cloneDeep(props.wrapper);
                        clone.status = nextStatus(clone.status);
                        clone.item.Title = ev.target.value;
                        props.onUpdate(clone);
                    }}
                    value={props.wrapper.item.Title}
                    style={{ width: '100px' }}
                />
            );
        }
        return props.wrapper.item.Title;
    }, [props.wrapper.item, props.wrapper.editable]);

    const description = React.useMemo(() => {
        if (props.wrapper.editable) {
            return (
                <textarea
                    onChange={(ev) => {
                        props.wrapper.status = nextStatus(props.wrapper.status);
                        props.wrapper.item.Description = ev.target.value;
                        props.onUpdate(props.wrapper);
                    }}
                    value={props.wrapper.item.Description}
                    style={{ width: '150px' }}
                />
            );
        }
        return props.wrapper.item.Description;
    }, [props.wrapper.item, props.wrapper.editable]);

    return (
        <>
            <div
                style={{
                    display: 'flex',
                    flexFlow: 'row nowrap',
                    gap: '.5em',
                    marginTop: '1em',
                }}
            >
                <div style={{ width: '5%', minWidth: '100px' }}>
                    <button onClick={() => props.onSplit()}>Split</button>
                </div>
                <div style={{ width: '10%', minWidth: '150px' }}>{activeFrom}</div>
                <div style={{ width: '10%', minWidth: '150px' }}>{activeTo}</div>
                <div style={{ width: '10%', minWidth: '150px' }}>{title}</div>
                <div style={{ width: '15%', minWidth: '200px' }}>{description}</div>
                <div style={{ width: '10%', minWidth: '150px' }}>
                    {props.wrapper.item.AssignedTo.Title}
                </div>
                <div style={{ width: '10%', minWidth: '150px' }}>{props.wrapper.item.Time}</div>
                <div
                    style={{
                        width: '10%',
                        minWidth: '150px',
                        display: 'flex',
                        flexFlow: 'row nowrap',
                    }}
                >
                    <button
                        onClick={() =>
                            props.onUpdate({
                                ...props.wrapper,
                                editable: !props.wrapper.editable,
                            })
                        }
                    >
                        Edit
                    </button>
                    <button
                        onClick={() =>
                            props.onUpdate({
                                ...props.wrapper,
                                status: 'deleted',
                            })
                        }
                    >
                        Delete
                    </button>
                </div>
            </div>
            <Separator />
        </>
    );
};

const testTasks: ITask[] = [
    {
        ID: 1,
        Title: 'Task1',
        Description: 'Some long text description',
        Time: '2022-01-01T10:00:00',
        AssignedTo: {
            ID: 1,
            Title: 'Andrei',
            EMail: 'andrei@mail.com',
        },
        ActiveFrom: '2022-01-01',
        ActiveTo: '2022-02-01',
        OriginalTaskId: null,
        DaysDuration: 0,
        Transferable: false,
        Type: TaskType.Daily,
        WeeklyDays: [],
    },
    {
        ID: 2,
        Title: 'Task1',
        Description:
            'Some long text descriptionSome long text descriptionSome long text descriptionSome long text descriptionSome long text description',
        Time: '2022-01-01T10:00:00',
        AssignedTo: {
            ID: 1,
            Title: 'Max',
            EMail: 'andrei@mail.com',
        },
        ActiveFrom: '2022-02-02',
        ActiveTo: '2099-01-01',
        OriginalTaskId: null,
        DaysDuration: 0,
        Transferable: false,
        Type: TaskType.Daily,
        WeeklyDays: [],
    },
];

const nextStatus = (status: TaskStatus): TaskStatus => {
    if (status === 'original') return 'updated';
    return status;
};

const getUpdatedFields = (task: ITask) => ({
    Title: task.Title,
    Description: task.Description,
    Time: task.Time,
    AssignedToId: task.AssignedTo.ID,
    ActiveFrom: task.ActiveFrom,
    ActiveTo: task.ActiveTo,
});

export const EditTasks: React.FC<IEditTasksProps> = (props) => {
    const { TaskService } = React.useContext(GlobalContext);
    const [errorMessage, setErrorMessage] = React.useState<string>(null);
    const [taskWrappers, setTaskWrappers] = React.useState<ITaskWrapper[]>([]);

    React.useEffect(() => {
        async function run() {
            const task = await TaskService.getTask(props.taskId);
            const originalId = task.OriginalTaskId || task.ID;
            const originalTasks = await TaskService.getTasksByOriginalId(originalId);
            const data: ITaskWrapper[] = originalTasks.map((task) => ({
                editable: false,
                item: task,
                status: 'original',
            }));
            // Sort data by Active to once
            data.sort((w1, w2) => {
                return w1.item.ActiveTo < w2.item.ActiveTo ? -1 : 1;
            });
            setTaskWrappers(data);
        }
        run();
    }, []);

    /**
     * Split the task, by creating a copy of it below
     * Only field that changes initially is DateTo on original task
     * and DateFrom on copy:
     * DateTo: [today] - 1
     * DateFrom: [today]
     * @param id Id of the task being split
     */
    const handleSplit = (idx: number) => () => {
        setTaskWrappers((prev) => {
            // const foundTaskIdx = clone.findIndex((task) => task.item.ID === id);
            if (idx > -1) {
                const foundTask = cloneDeep(prev[idx]);
                const copyTask = cloneDeep(foundTask);
                const today = DateTime.now();
                foundTask.item.ActiveTo = today.plus({ days: -1 }).toISODate();
                foundTask.status = nextStatus(foundTask.status);
                copyTask.item.ActiveFrom = today.toISODate();
                if (copyTask.item.ActiveTo < copyTask.item.ActiveFrom) {
                    copyTask.item.ActiveTo = copyTask.item.ActiveFrom;
                }
                copyTask.editable = true;
                copyTask.status = 'new';
                copyTask.item.ID += 1;
                return [...prev.slice(0, idx), foundTask, copyTask, ...prev.slice(idx + 1)];
            }
            return prev;
        });
    };

    const handleUpdate = (idx: number) => (wrapper: ITaskWrapper) => {
        setTaskWrappers((prev) => {
            return [...prev.slice(0, idx), cloneDeep(wrapper), ...prev.slice(idx + 1)];
        });
    };

    /**
     * Pressing save button:
     * Loop through each wrapper and check status.
     * If status:
     *  'updated' => update undelying task
     *  'new' => create new task with originaltaskid pointing to current task
     *  'deleted' => if task is created (has ID), delete the task
     *  'original' => do nothing
     */
    const handleSave = () => {
        const calls = taskWrappers.map(async (wrapper) => {
            const task = wrapper.item;
            if (wrapper.status === 'updated') {
                return TaskService.updateTask(task.ID, getUpdatedFields(task));
            } else if (wrapper.status === 'new') {
                const original = taskWrappers.find((w) => w.item.ID === props.taskId);
                return TaskService.createTask({
                    ...task,
                    OriginalTaskId: original.item.OriginalTaskId || original.item.ID,
                })
            }
        });
        Promise.all(calls).then(() => closePanel('SP_TASKS'));
    };

    /**
     * Set panel properties
     */
    React.useEffect(() => {
        setPanelProperties('SP_TASKS', {
            headerText: 'Edit tasks',
            isFooterAtBottom: true,
            onRenderFooterContent: (_props) => (
                <>
                    <PrimaryButton onClick={handleSave}>Save</PrimaryButton>
                    <DefaultButton
                        style={{ marginLeft: '.5em' }}
                        onClick={() => closePanel('SP_TASKS')}
                    >
                        Close
                    </DefaultButton>
                </>
            ),
        });
    }, [taskWrappers]);

    return (
        <div>
            <div>{errorMessage}</div>
            <div>
                {taskWrappers.map((taskWrapper, idx) => (
                    <EditTaskDetail
                        wrapper={taskWrapper}
                        onSplit={handleSplit(idx)}
                        onUpdate={handleUpdate(idx)}
                    />
                ))}
            </div>
        </div>
    );
};
