import { isNumber, cloneDeep } from 'lodash';
import ITask, { TaskType, WeekDay, WeekDayMap } from '@service/sp-tasks/dist/models/ITask';
import { DateTime } from 'luxon';
import {
    ComboBox,
    DatePicker,
    DefaultButton,
    DetailsList,
    DetailsListLayoutMode,
    DetailsRow,
    Dropdown,
    enableBodyScroll,
    IColumn,
    IconButton,
    IDetailsRowProps,
    IDropdownOption,
    IStyle,
    ITag,
    ITextFieldProps,
    MessageBar,
    MessageBarType,
    Persona,
    PrimaryButton,
    SelectionMode,
    SpinButton,
    TagPicker,
    Text,
    TextField,
} from '@fluentui/react';
import * as React from 'react';
import { SPnotify } from 'sp-react-notifications';
import { closePanel, setPanelProperties } from '../../hooks/usePanel';
import GlobalContext from '../../utils/GlobalContext';
import { userToPeoplePickerOption } from '../../utils/utils';
import { UserPicker } from '../user-selector/UserPicker';

export interface IEditTasksProps {
    taskId: number;
}

interface ITaskWrapper {
    item: ITask;
    editable: boolean;
    status: TaskStatus;
    touchedFields: Set<string>;
}

type TaskStatus = 'new' | 'updated' | 'original' | 'deleted';

interface ITaskCellProps {
    wrapper: ITaskWrapper;
    index?: number;
    fieldName?: string;
    onUpdate: (wrapper: ITaskWrapper) => void;
}

/** Utils */
const nextStatus = (status: TaskStatus): TaskStatus => {
    if (status === 'original') return 'updated';
    return status;
};

const cloneWrapperSetItem = (
    wrapper: ITaskWrapper,
    setter: (item: ITaskWrapper) => void,
    touchedField?: string
) => {
    const clone = { ...wrapper };
    clone.item = { ...wrapper.item };
    clone.status = nextStatus(clone.status);
    setter(clone);
    if (touchedField) {
        clone.touchedFields.add(touchedField);
    }
    return clone;
};

const TextCell: React.FC<ITaskCellProps & { textProps?: ITextFieldProps }> = ({
    wrapper,
    onUpdate,
    fieldName,
    textProps,
}) => {
    if (wrapper.editable) {
        return (
            <TextField
                {...textProps}
                value={wrapper.item[fieldName as keyof ITask] as string}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                onChange={(_ev: any, newVal: string) => {
                    return onUpdate(
                        cloneWrapperSetItem(
                            wrapper,
                            (w) => ((w.item[fieldName as keyof ITask] as string) = newVal),
                            fieldName
                        )
                    );
                }}
            />
        );
    }
    return <Text variant="medium">{wrapper.item[fieldName as keyof ITask]}</Text>;
};

const TypeCell: React.FC<ITaskCellProps> = ({ wrapper, onUpdate }) => {
    const options: IDropdownOption[] = React.useMemo(
        () => [
            {
                key: TaskType.Daily,
                text: TaskType.Daily,
            },
            {
                key: TaskType.Weekly,
                text: TaskType.Weekly,
            },
            {
                key: TaskType.Monthly,
                text: TaskType.Monthly,
            },
            {
                key: TaskType.Quarter,
                text: TaskType.Quarter,
            },
        ],
        []
    );
    const days: ITag[] = [WeekDay.Mon, WeekDay.Tue, WeekDay.Wed, WeekDay.Thu, WeekDay.Fri].map(
        (day) => ({ key: day, name: day })
    )

    if (wrapper.editable) {
        const isActive = DateTime.fromISO(wrapper.item.ActiveTo) > DateTime.now()

        const additionalControls: JSX.Element[] = [];
        if (wrapper.item.Type === TaskType.Weekly) {
            additionalControls.push((
                <div style={{backgroundColor: 'white'}}>
                    <TagPicker
                        disabled={!isActive}
                        onEmptyResolveSuggestions={(items) => {
                            const set = new Set(items.map((i) => i.key));
                            return days.filter((d) => !set.has(d.key));
                        }}
                        onResolveSuggestions={(filter) =>
                            days.filter((d) => d.name.toLowerCase().includes(filter.toLowerCase()))
                        }
                        selectedItems={days.filter(
                            (d) => wrapper.item.WeeklyDays?.indexOf(d.name as WeekDay) > -1
                        )}
                        onChange={(items) =>
                            onUpdate(
                                cloneWrapperSetItem(
                                    wrapper,
                                    (w) => (w.item.WeeklyDays = items.map((i) => i.key as WeekDay)),
                                    'WeeklyDays'
                                )
                            )
                        }
                    />
                </div>
            ))
        } else if (wrapper.item.Type === TaskType.Monthly) {
            additionalControls.push(
                <SpinButton
                    disabled={!isActive}
                    value={wrapper.item.MonthlyDay?.toString() || '1'}
                    min={1}
                    max={31}
                    onValidate={(v) => {
                        const num = +v;
                        let result = num;
                        if (!isNumber(num)) {
                            result = 1;
                        } else if (num < 1) {
                            result = 1;
                        } else if (num > 31) {
                            result = 31;
                        }
                        onUpdate(cloneWrapperSetItem(wrapper, (w) => (w.item.MonthlyDay = result), 'MonthlyDay'));
                        return result.toString();
                    }}
                    onIncrement={(v) =>
                        isNumber(+v) && +v < 31
                            ? onUpdate(
                                cloneWrapperSetItem(wrapper, (w) => (w.item.MonthlyDay = +v + 1), 'MonthlyDay')
                            )
                            : null
                    }
                    onDecrement={(v) =>
                        isNumber(+v) && +v > 1
                            ? onUpdate(
                                cloneWrapperSetItem(wrapper, (w) => (w.item.MonthlyDay = +v - 1), 'MonthlyDay')
                            )
                            : null
                    }
                />
            )
        }
        return (
            <div
                style={{
                    display: 'flex',
                    flexFlow: 'column nowrap',
                    gap: '.5em',
                }}
            >
                <Dropdown
                    disabled={!isActive}
                    options={options}
                    selectedKey={wrapper.item.Type}
                    onChange={(_: React.FormEvent<HTMLDivElement>, option?: IDropdownOption) => {
                        onUpdate(
                            cloneWrapperSetItem(
                                wrapper,
                                (w) => {
                                    w.item.Type = option.text as TaskType;
                                },
                                'Type'
                            )
                        );
                    }}
                />
                {...additionalControls}
            </div>
        );
    }
    return (
        <div
            style={{
                display: 'flex',
                flexFlow: 'column nowrap',
                gap: '.5em'
            }}
        >
            <Text variant="medium">{wrapper.item.Type}</Text>
            { /*WEEKLY*/ wrapper.item.Type === TaskType.Weekly && (
                <Text variant="medium">{wrapper.item.WeeklyDays.sort((a, b) => {
                    return WeekDayMap[a] - WeekDayMap[b]
                }).join("; ")}</Text>
            ) }
            { /*MONTHLY*/ wrapper.item.Type === TaskType.Monthly && (
                <Text variant="medium">Day (Calendar): {wrapper.item.MonthlyDay}</Text>
            ) }
        </div>
    );
};

const TimeCell: React.FC<ITaskCellProps> = ({ wrapper, onUpdate }) => {
    const dt = DateTime.fromISO(wrapper.item.Time);
    const hourOptions = React.useMemo(
        () =>
            Array(24)
                .fill(0)
                .map((val, idx) => ({
                    key: idx,
                    text: ('0' + idx).slice(-2),
                })),
        []
    );
    const minuteOptions = React.useMemo(
        () =>
            Array(12)
                .fill(0)
                .map((val, idx) => ({
                    key: idx * 5,
                    text: ('0' + idx * 5).slice(-2),
                })),
        []
    );
    if (wrapper.editable) {
        return (
            <div
                style={{
                    display: 'flex',
                    flexFlow: 'row nowrap',
                    gap: '.3em',
                }}
            >
                <ComboBox
                    selectedKey={dt.hour}
                    options={hourOptions}
                    useComboBoxAsMenuWidth
                    calloutProps={{
                        calloutMaxHeight: 400,
                    }}
                    onChange={(_ev, option) => {
                        const newDate = dt.set({
                            hour: +option.key,
                        });
                        onUpdate(
                            cloneWrapperSetItem(
                                wrapper,
                                (w) => (w.item.Time = newDate.toISO()),
                                'Time'
                            )
                        );
                    }}
                />
                <ComboBox
                    selectedKey={dt.minute}
                    options={minuteOptions}
                    useComboBoxAsMenuWidth
                    calloutProps={{
                        calloutMaxHeight: 400,
                    }}
                    onChange={(_ev, option) => {
                        const newDate = dt.set({
                            minute: +option.key,
                        });
                        onUpdate(
                            cloneWrapperSetItem(
                                wrapper,
                                (w) => (w.item.Time = newDate.toISO()),
                                'Time'
                            )
                        );
                    }}
                />
            </div>
        );
    }
    return <Text variant="medium">{dt.toLocaleString(DateTime.TIME_24_SIMPLE)}</Text>;
};

const ActiveDateCell: React.FC<ITaskCellProps> = ({ wrapper, onUpdate, fieldName }) => {
    const dt = DateTime.fromISO(wrapper.item[fieldName as keyof ITask] as string);
    if (wrapper.editable) {
        return (
            <DatePicker
                allowTextInput
                allFocusable
                value={dt.toJSDate()}
                formatDate={(date) => date.toLocaleDateString()}
                onSelectDate={(date) => {
                    return onUpdate(
                        cloneWrapperSetItem(
                            wrapper,
                            (w) =>
                                ((w.item[fieldName as keyof ITask] as string) = date.toISOString()),
                            fieldName
                        )
                    );
                }}
            />
        );
    }
    return <Text variant="medium">{dt.toLocaleString()}</Text>;
};

const SelectUserCell: React.FC<ITaskCellProps> = ({ wrapper, onUpdate }) => {
    const { teamMembers, currentUser } = React.useContext(GlobalContext);

    const userList = React.useMemo(() => {
        return [...teamMembers.All, currentUser];
    }, [teamMembers, currentUser]);

    if (wrapper.editable) {
        return (
            <UserPicker
                selectedUserId={wrapper.item.AssignedTo?.ID || -1}
                onChange={(userId) => {
                    onUpdate(
                        cloneWrapperSetItem(
                            wrapper,
                            (w) => {
                                const foundUser = userList.find((u) => u.User.ID === userId);
                                if (foundUser) {
                                    w.item.AssignedTo = foundUser.User;
                                } else {
                                    w.item.AssignedTo = null;
                                }
                            },
                            'AssignedTo'
                        )
                    );
                }}
            />
        );
    }

    if (!wrapper.item.AssignedTo) return null;

    return (
        <Persona
            {...userToPeoplePickerOption({ User: wrapper.item.AssignedTo, Teams: [], Role: '' })}
        />
    );
};

const getUpdatedFields = (task: ITask) => ({
    Title: task.Title,
    Description: task.Description,
    Type: task.Type,
    WeeklyDays: task.WeeklyDays || [],
    MonthlyDay: task.MonthlyDay,
    Transferable: task.Transferable,
    Time: task.Time,
    AssignedToId: task.AssignedTo.ID,
    ActiveFrom: task.ActiveFrom,
    ActiveTo: task.ActiveTo,
});

export const EditTasks: React.FC<IEditTasksProps> = (props) => {
    const { TaskService, TaskLogsService } = React.useContext(GlobalContext);
    const [taskWrappers, setTaskWrappers] = React.useState<ITaskWrapper[]>([]);
    const [activeIndex, setActiveIndex] = React.useState(-1);
    const [overlappingIndexes, setOverlappingIndexes] = React.useState([]);

    React.useEffect(() => {
        async function run() {
            const task = await TaskService.getTask(props.taskId);
            const originalId = task.OriginalTaskId || task.ID;
            const originalTasks = await TaskService.getTasksByOriginalId(originalId);
            const data: ITaskWrapper[] = originalTasks.map((task: ITask) => ({
                editable: false,
                item: task,
                status: 'original',
                touchedFields: new Set(),
            }));
            // Sort data by Active to once
            data.sort((w1, w2) => {
                return w1.item.ActiveTo < w2.item.ActiveTo ? -1 : 1;
            });
            setTaskWrappers(data);
        }
        run();
    }, []);

    React.useEffect(() => {
        const today = DateTime.now().startOf('day');
        const foundActiveIdx = taskWrappers.findIndex((w) => {
            const from = DateTime.fromISO(w.item.ActiveFrom).startOf('day');
            const to = DateTime.fromISO(w.item.ActiveTo).endOf('day');
            if (today >= from && today <= to) return true;
            return false;
        });
        setActiveIndex(foundActiveIdx);
        const overlapping = [];
        for (let index = 0; index < taskWrappers.length - 1; index++) {
            const current = taskWrappers[index];
            if (current.status === 'deleted') continue;
            const next = taskWrappers.slice(index + 1).find((w) => w.status !== 'deleted');
            if (!next) continue;
            if (next.status === 'deleted') continue;
            const currentFrom = DateTime.fromISO(current.item.ActiveFrom).startOf('day');
            const currentTo = DateTime.fromISO(current.item.ActiveTo).endOf('day');
            const nextFrom = DateTime.fromISO(next.item.ActiveFrom).startOf('day');
            if (nextFrom <= currentTo) {
                overlapping.push(index, index + 1);
                index++;
            } else if (currentFrom >= currentTo) {
                overlapping.push(index);
            }
        }
        setOverlappingIndexes(overlapping);
    }, [taskWrappers]);

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
                foundTask.touchedFields.add('ActiveTo');
                foundTask.status = nextStatus(foundTask.status);
                copyTask.item.ActiveFrom = today.toISODate();
                copyTask.touchedFields.add('ActiveFrom');
                if (copyTask.item.ActiveTo < copyTask.item.ActiveFrom) {
                    copyTask.item.ActiveTo = copyTask.item.ActiveFrom;
                    copyTask.touchedFields.add('ActiveTo');
                }
                copyTask.editable = true;
                copyTask.status = 'new';
                copyTask.item.ID = null;
                return [...prev.slice(0, idx), foundTask, copyTask, ...prev.slice(idx + 1)];
            }
            return prev;
        });
    };

    const handleUpdate = (idx: number) => (wrapper: ITaskWrapper) => {
        setTaskWrappers((prev) => {
            return [...prev.slice(0, idx), wrapper, ...prev.slice(idx + 1)];
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
        async function clearTaskLogsFromToday(taskId: number) {
            return TaskLogsService.clearTaskLogsByTaskId(taskId, new Date());
        }
        const originalTask = taskWrappers.find((w) => w.item.ID === props.taskId);
        const calls = taskWrappers.map(async (wrapper) => {
            let task = wrapper.item;
            if (wrapper.status === 'updated') {
                // If Type was changed
                if (wrapper.touchedFields.has('Type')) {
                    // Update the Transferable flag
                    task = updateTaskAfterTypeChanged(task)
                }
                // If Task was updated and is active, remove all future tasks
                const activeTo = DateTime.fromISO(wrapper.item.ActiveTo);
                if (
                    wrapper.touchedFields.has('ActiveTo') ||
                    wrapper.touchedFields.has('Type') ||
                    activeTo > DateTime.now()
                ) {
                    await clearTaskLogsFromToday(wrapper.item.ID);
                }
                return TaskService.updateTask(task.ID, getUpdatedFields(task));
            } else if (wrapper.status === 'new') {
                const original = taskWrappers.find((w) => w.item.ID === props.taskId);
                return TaskService.createTask({
                    ...task,
                    OriginalTaskId: original.item.OriginalTaskId || original.item.ID,
                });
            } else if (wrapper.status === 'deleted' && wrapper.item.ID) {
                await clearTaskLogsFromToday(wrapper.item.ID);
                return TaskService.deleteTask(wrapper.item.ID);
            }
        });
        Promise.all(calls).then(() => {
            closePanel('SP_TASKS');
            // If something was updated, show a message
            if (taskWrappers.filter((w) => w.status !== 'original').length > 0) {
                SPnotify({
                    message: `Task '${originalTask.item.Title}' updated!`,
                    messageType: MessageBarType.success,
                    timeout: 10000,
                });
            }
        });
    };

    /**
     * Set panel properties
     */
    React.useEffect(() => {
        setPanelProperties('SP_TASKS', {
            headerText: 'Edit tasks',
            isFooterAtBottom: true,
            onRenderFooterContent: () => (
                <>
                    <PrimaryButton disabled={overlappingIndexes.length > 0} onClick={handleSave}>
                        Save
                    </PrimaryButton>
                    <DefaultButton
                        style={{ marginLeft: '.5em' }}
                        onClick={() => closePanel('SP_TASKS')}
                    >
                        Close
                    </DefaultButton>
                </>
            ),
        });
    }, [taskWrappers, overlappingIndexes]);

    const columns: IColumn[] = React.useMemo(
        () => [
            {
                key: 'split',
                minWidth: 40,
                name: '',
                onRender: (item, index) => (
                    <IconButton
                        iconProps={{ iconName: 'CPlusPlusLanguage' }}
                        onClick={handleSplit(index)}
                    />
                ),
            },
            {
                key: 'ActiveFrom',
                minWidth: 120,
                name: 'Active from',
                onRender: (item, idx) => (
                    <ActiveDateCell
                        wrapper={item}
                        onUpdate={handleUpdate(idx)}
                        fieldName="ActiveFrom"
                    />
                ),
            },
            {
                key: 'ActiveTo',
                minWidth: 120,
                name: 'Active to',
                onRender: (item, idx) => (
                    <ActiveDateCell
                        wrapper={item}
                        onUpdate={handleUpdate(idx)}
                        fieldName="ActiveTo"
                    />
                ),
            },
            {
                key: 'Title',
                minWidth: 150,
                isResizable: true,
                name: 'Title',
                onRender: (item, idx) => (
                    <TextCell wrapper={item} onUpdate={handleUpdate(idx)} fieldName="Title" />
                ),
            },
            {
                key: 'Description',
                minWidth: 200,
                isResizable: true,
                name: 'Description',
                onRender: (item, idx) => (
                    <TextCell
                        wrapper={item}
                        onUpdate={handleUpdate(idx)}
                        fieldName="Description"
                        textProps={{
                            multiline: true,
                            resizable: false,
                            autoAdjustHeight: true,
                        }}
                    />
                ),
            },
            {
                key: 'Type',
                minWidth: 200,
                isResizable: true,
                name: 'Type',
                onRender: (item, idx) => <TypeCell wrapper={item} onUpdate={handleUpdate(idx)} />,
            },
            {
                key: 'AssignedTo',
                minWidth: 200,
                name: 'Assigned to',
                onRender: (item, idx) => (
                    <SelectUserCell key={item.id} wrapper={item} onUpdate={handleUpdate(idx)} />
                ),
            },
            {
                key: 'Time',
                minWidth: 150,
                name: 'Time',
                onRender: (item, idx) => <TimeCell wrapper={item} onUpdate={handleUpdate(idx)} />,
            },
            {
                key: 'actions',
                minWidth: 80,
                name: '',
                flexGrow: 2,
                onRender: (item, idx) => (
                    <>
                        <IconButton
                            iconProps={{
                                iconName: item.editable ? 'Uneditable2' : 'Edit',
                            }}
                            onClick={() => {
                                handleUpdate(idx)(
                                    cloneWrapperSetItem(item, (w) => (w.editable = !w.editable))
                                );
                            }}
                        />
                        <IconButton
                            iconProps={{
                                iconName: 'Delete',
                            }}
                            onClick={() => {
                                handleUpdate(idx)(
                                    cloneWrapperSetItem(item, (w) => (w.status = 'deleted'))
                                );
                            }}
                        />
                    </>
                ),
            },
        ],
        [activeIndex, overlappingIndexes]
    );

    const onRenderRow = (props: IDetailsRowProps) => {
        if (props.item.status === 'deleted') return <Text>--- Deleted ---</Text>;
        const rootStyles: IStyle = {};
        if (
            overlappingIndexes.length > 0 &&
            overlappingIndexes.find((i) => i === props.itemIndex)
        ) {
            rootStyles.backgroundColor = 'rgba(218, 59, 1, .2)';
            rootStyles['&:hover'] = {
                backgroundColor: 'rgba(218, 59, 1, .1)',
            };
        }
        if (props.itemIndex === activeIndex) {
            rootStyles.backgroundColor = 'rgba(140, 189, 24, .2)';
            rootStyles['&:hover'] = {
                backgroundColor: 'rgba(140, 189, 24, .1)',
            };
        }
        return <DetailsRow {...props} styles={{ root: rootStyles }} />;
    };

    let errorMessage = null;
    if (overlappingIndexes.length > 0) {
        errorMessage = (
            <MessageBar messageBarType={MessageBarType.error}>Overlapping periods!</MessageBar>
        );
    }

    enableBodyScroll();

    return (
        <div>
            {errorMessage}
            <DetailsList
                items={taskWrappers}
                layoutMode={DetailsListLayoutMode.fixedColumns}
                selectionMode={SelectionMode.none}
                compact
                columns={columns}
                onRenderRow={onRenderRow}
                enterModalSelectionOnTouch
            />
        </div>
    );
};

function updateTaskAfterTypeChanged(task: ITask): ITask {
    const result = { ...task }
    switch (task.Type) {
        case TaskType.Daily:
            result.Transferable = false
            result.WeeklyDays = []
            result.MonthlyDay = 0
            break;
        case TaskType.Weekly:
            result.Transferable = true
            result.MonthlyDay = 0            
            break;
        case TaskType.Monthly:
            result.Transferable = true
            result.WeeklyDays = []
            break;
        case TaskType.Quarter:
            result.Transferable = false
            result.WeeklyDays = []
            result.MonthlyDay = 0
            break;
    }
    return result;
}
