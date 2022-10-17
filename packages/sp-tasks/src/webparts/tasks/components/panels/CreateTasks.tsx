import { isNumber, cloneDeep } from 'lodash';
import { DateTime } from 'luxon';
import {
    ActionButton,
    DatePicker,
    DefaultButton,
    Dropdown,
    IconButton,
    IDropdownOption,
    ITag,
    MessageBar,
    MessageBarType,
    PrimaryButton,
    SpinButton,
    TagPicker,
    TextField,
} from 'office-ui-fabric-react';
import * as React from 'react';
import { SPnotify } from 'sp-react-notifications';
import { closePanel, setPanelProperties } from '../../hooks/usePanel';
import ITask, { TaskType, WeekDay } from '../../models/ITask';
import GlobalContext from '../../utils/GlobalContext';
import { TimePicker } from '../time-picker/TimePicker';
import { UserPicker } from '../user-selector/UserPicker';
import styles from './CreateTasks.module.scss';

interface ICreateTaskWrapper {
    task: Partial<ITask & { AssignedToId: number }>;
    complete: boolean;
}

interface ITaskWizard {
    wrapper: ICreateTaskWrapper;
    onUpdate: (wrapper: ICreateTaskWrapper) => void;
    onCopy: () => void;
    onDelete: () => void;
    highlightIncomplete: boolean;
}

interface ICreationStep {
    key: string;
    onRender: (wrapper: ICreateTaskWrapper) => JSX.Element;
}

type StepGenerator = (wrapper: ICreateTaskWrapper) => ICreationStep[];

/** Helper functions */
const createBlankTaskWizard = (): ICreateTaskWrapper => {
    return {
        complete: false,
        task: {
            Title: '',
            Description: '',
            Type: TaskType.Daily,
            ActiveFrom: DateTime.now().toISODate(),
            ActiveTo: DateTime.fromISO('2099-01-01').toISODate(),
            DaysDuration: 0,
            Time: DateTime.now().set({ hour: 9, minute: 0 }).toISO(),
            AssignedToId: 0,
            Transferable: false,
            WeeklyDays: [],
        },
    };
};

const wrapperSetValue = (w: ICreateTaskWrapper, setter: (w: ICreateTaskWrapper) => void) => {
    const clone = cloneDeep(w);
    setter(clone);
    return clone;
};

const calculateComplete = (wrappers: ICreateTaskWrapper[]) => {
    wrappers.forEach((w) => {
        w.complete = true;
        const task = w.task;
        if (
            task.Title === '' ||
            task.Time === '' ||
            task.ActiveFrom === '' ||
            task.ActiveTo === '' ||
            !task.AssignedToId
        ) {
            w.complete = false;
        }
        if (task.Type === TaskType.Weekly) {
            if (!task.WeeklyDays || task.WeeklyDays.length === 0) {
                w.complete = false;
            }
        } else if (task.Type === TaskType.Monthly) {
            if (!task.MonthlyDay || task.MonthlyDay < 1) {
                w.complete = false;
            }
        } 
    });
    return wrappers;
};
/** Helper functions */

/** Steps */
interface ICreationStepProps {
    wrapper: ICreateTaskWrapper;
    onUpdate: (wrapper: ICreateTaskWrapper) => void;
}

const TitleDescription: React.FC<ICreationStepProps> = ({ wrapper, onUpdate }) => {
    return (
        <div className={styles.taskWrapperStep}>
            <div className={styles.taskWrapperStepText}>Task</div>
            <div className={styles.taskWrapperStepTitleDescription}>
                <TextField
                    autoComplete="off"
                    placeholder="Title"
                    value={wrapper.task.Title}
                    onChange={(ev, newValue) =>
                        onUpdate(wrapperSetValue(wrapper, (w) => (w.task.Title = newValue)))
                    }
                />
                <TextField
                    autoAdjustHeight
                    autoComplete="off"
                    multiline
                    placeholder="Description"
                    resizable={false}
                    value={wrapper.task.Description}
                    onChange={(ev, newValue) =>
                        onUpdate(wrapperSetValue(wrapper, (w) => (w.task.Description = newValue)))
                    }
                />
            </div>
            <div className={styles.taskWrapperStepText}>,</div>
        </div>
    );
};

const AssignedTo: React.FC<ICreationStepProps> = ({ wrapper, onUpdate }) => {
    return (
        <div className={styles.taskWrapperStep}>
            <div className={styles.taskWrapperStepText}>assigned to</div>
            <div className={styles.taskWrapperStepInputBlock}>
                <UserPicker
                    selectedUserId={wrapper.task.AssignedToId || 0}
                    onChange={(id) =>
                        onUpdate(wrapperSetValue(wrapper, (w) => (w.task.AssignedToId = id)))
                    }
                />
            </div>
            <div className={styles.taskWrapperStepText}>,</div>
        </div>
    );
};

const TaskTypeStep: React.FC<ICreationStepProps> = ({ wrapper, onUpdate }) => {
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
        ],
        []
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleChange = (_ev: any, opt: any) => {
        onUpdate(
            wrapperSetValue(wrapper, (w) => {
                switch (opt.key) {
                    case TaskType.Daily:
                        w.task.Transferable = false;
                        w.task.WeeklyDays = [];
                        w.task.MonthlyDay = null;
                        break;
                    case TaskType.Weekly:
                        w.task.Transferable = true;
                        w.task.MonthlyDay = null;
                        break;
                    case TaskType.Monthly:
                        w.task.Transferable = true;
                        w.task.WeeklyDays = [];
                        break;
                }
                w.task.Type = opt.key as TaskType;
            })
        );
    };

    return (
        <div className={styles.taskWrapperStep}>
            <div className={styles.taskWrapperStepText}>to be done</div>
            <div className={styles.taskWrapperStepInputBlock}>
                <Dropdown
                    styles={{
                        title: {
                            minWidth: '90px',
                        },
                    }}
                    options={options}
                    selectedKey={wrapper.task.Type}
                    onChange={handleChange}
                />
            </div>
            <div className={styles.taskWrapperStepText}>,</div>
        </div>
    );
};

const TimeStep: React.FC<ICreationStepProps> = ({ wrapper, onUpdate }) => {
    return (
        <div className={styles.taskWrapperStep}>
            <div className={styles.taskWrapperStepText}>before</div>
            <div className={styles.taskWrapperStepInputBlock}>
                <TimePicker
                    value={wrapper.task.Time}
                    daysValue={wrapper.task.DaysDuration}
                    onDaysDelayChange={(n) =>
                        onUpdate(wrapperSetValue(wrapper, (w) => (w.task.DaysDuration = n)))
                    }
                    onTimeChange={(t) =>
                        onUpdate(wrapperSetValue(wrapper, (w) => (w.task.Time = t)))
                    }
                />
            </div>
            <div className={styles.taskWrapperStepText}>,</div>
        </div>
    );
};

const WeeklyDaysSteps: React.FC<ICreationStepProps> = ({ wrapper, onUpdate }) => {
    const days: ITag[] = [WeekDay.Mon, WeekDay.Tue, WeekDay.Wed, WeekDay.Thu, WeekDay.Fri].map(
        (day) => ({ key: day, name: day })
    );
    return (
        <div className={styles.taskWrapperStep}>
            <div className={styles.taskWrapperStepText}>on</div>
            <div className={styles.taskWrapperStepInputBlock}>
                <TagPicker
                    styles={{
                        text: {
                            maxWidth: 150,
                        },
                    }}
                    onEmptyResolveSuggestions={(items) => {
                        const set = new Set(items.map((i) => i.key));
                        return days.filter((d) => !set.has(d.key));
                    }}
                    onResolveSuggestions={(filter) =>
                        days.filter((d) => d.name.toLowerCase().includes(filter.toLowerCase()))
                    }
                    selectedItems={days.filter(
                        (d) => wrapper.task.WeeklyDays.indexOf(d.name as WeekDay) > -1
                    )}
                    onChange={(items) =>
                        onUpdate(
                            wrapperSetValue(
                                wrapper,
                                (w) => (w.task.WeeklyDays = items.map((i) => i.key as WeekDay))
                            )
                        )
                    }
                />
            </div>
            <div className={styles.taskWrapperStepText}>.</div>
        </div>
    );
};

const TransferableStep: React.FC<ICreationStepProps> = ({ wrapper, onUpdate }) => {
    return (
        <div className={styles.taskWrapperStep}>
            <div className={styles.taskWrapperStepText}>Transferable -</div>
            <div className={styles.taskWrapperStepInputBlock}>
                <Dropdown
                    options={[
                        {
                            key: 1,
                            text: 'Yes',
                        },
                        {
                            key: 0,
                            text: 'No',
                        },
                    ]}
                    selectedKey={wrapper.task.Transferable ? 1 : 0}
                    onChange={(ev, opt) =>
                        onUpdate(
                            wrapperSetValue(wrapper, (w) => (w.task.Transferable = opt.key === 1))
                        )
                    }
                />
            </div>
            <div className={styles.taskWrapperStepText}>.</div>
        </div>
    );
};

const MonthlyDayStep: React.FC<ICreationStepProps> = ({ wrapper, onUpdate }) => {
    return (
        <div className={styles.taskWrapperStep}>
            <div className={styles.taskWrapperStepText}>On</div>
            <div className={styles.taskWrapperStepInputBlock}>
                <SpinButton
                    styles={{
                        root: {
                            maxWidth: 50,
                        },
                    }}
                    value={wrapper.task.MonthlyDay?.toString() || '1'}
                    min={1}
                    max={22}
                    onValidate={(v) => {
                        const num = +v;
                        let result = num;
                        if (!isNumber(num)) {
                            result = 1;
                        } else if (num < 1) {
                            result = 1;
                        } else if (num > 22) {
                            result = 22;
                        }
                        onUpdate(wrapperSetValue(wrapper, (w) => (w.task.MonthlyDay = result)));
                        return result.toString();
                    }}
                    onIncrement={(v) =>
                        isNumber(+v) && +v < 22
                            ? onUpdate(
                                  wrapperSetValue(wrapper, (w) => (w.task.MonthlyDay = +v + 1))
                              )
                            : null
                    }
                    onDecrement={(v) =>
                        isNumber(+v) && +v > 1
                            ? onUpdate(
                                  wrapperSetValue(wrapper, (w) => (w.task.MonthlyDay = +v - 1))
                              )
                            : null
                    }
                />
            </div>
            <div style={{ marginLeft: '4px' }} className={styles.taskWrapperStepText}>
                working day.
            </div>
        </div>
    );
};

const ActiveStep: React.FC<ICreationStepProps> = ({ wrapper, onUpdate }) => {
    return (
        <div className={styles.taskWrapperStep}>
            <div className={styles.taskWrapperStepText}>Active</div>
            <div className={styles.taskWrapperStepInputBlock}>
                <DatePicker
                    styles={{
                        root: {
                            maxWidth: 110,
                        },
                    }}
                    value={new Date(wrapper.task.ActiveFrom)}
                    onSelectDate={(date) =>
                        onUpdate(
                            wrapperSetValue(
                                wrapper,
                                (w) => (w.task.ActiveFrom = date.toISOString())
                            )
                        )
                    }
                    formatDate={(d) => d.toLocaleDateString()}
                />
            </div>
            <div style={{ marginLeft: '.5em' }} className={styles.taskWrapperStepText}>
                {' '}
                -{' '}
            </div>
            <div className={styles.taskWrapperStepInputBlock}>
                <DatePicker
                    styles={{
                        root: {
                            maxWidth: 110,
                        },
                    }}
                    value={new Date(wrapper.task.ActiveTo)}
                    onSelectDate={(date) =>
                        onUpdate(
                            wrapperSetValue(wrapper, (w) => (w.task.ActiveTo = date.toISOString()))
                        )
                    }
                    formatDate={(d) => d.toLocaleDateString()}
                />
            </div>
            <div className={styles.taskWrapperStepText}>.</div>
        </div>
    );
};

/** Steps */

const TaskWizard: React.FC<ITaskWizard> = ({ wrapper, onUpdate, onCopy, onDelete, highlightIncomplete }) => {
    const flow: (ICreationStep | StepGenerator)[] = React.useMemo(
        () => [
            {
                key: 'TitleDescription',
                onRender: (w) => <TitleDescription wrapper={w} onUpdate={onUpdate} />,
            },
            {
                key: 'AssignedTo',
                onRender: (w) => <AssignedTo wrapper={w} onUpdate={onUpdate} />,
            },
            {
                key: 'Type',
                onRender: (w) => <TaskTypeStep wrapper={w} onUpdate={onUpdate} />,
            },
            {
                key: 'Time',
                onRender: (w) => <TimeStep wrapper={w} onUpdate={onUpdate} />,
            },
            function (wrapper: ICreateTaskWrapper) {
                const result = [];
                switch (wrapper.task.Type) {
                    case TaskType.Weekly:
                        result.push(
                            {
                                key: 'WeeklyDays',
                                onRender: (w: ICreateTaskWrapper) => (
                                    <WeeklyDaysSteps wrapper={w} onUpdate={onUpdate} />
                                ),
                            },
                            {
                                key: 'Transferable',
                                onRender: (w: ICreateTaskWrapper) => (
                                    <TransferableStep wrapper={w} onUpdate={onUpdate} />
                                ),
                            }
                        );
                        break;
                    case TaskType.Monthly:
                        result.push(
                            {
                                key: 'MonthlyDay',
                                onRender: (w: ICreateTaskWrapper) => <MonthlyDayStep wrapper={w} onUpdate={onUpdate} />,
                            },
                            {
                                key: 'Transferable',
                                onRender: (w: ICreateTaskWrapper) => (
                                    <TransferableStep wrapper={w} onUpdate={onUpdate} />
                                ),
                            }
                        );
                        break;
                }
                return result;
            },
            {
                key: 'Active',
                onRender: (w) => <ActiveStep wrapper={w} onUpdate={onUpdate} />,
            },
        ],
        [wrapper, onUpdate]
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const renderFlow: any = React.useCallback(
        (
            step: ICreationStep | ((step: ICreateTaskWrapper) => ICreationStep[]),
            w: ICreateTaskWrapper
        ) => {
            if (typeof step === 'function') {
                return step(w).map((s) => renderFlow(s, w));
            }
            return step.onRender(w);
        },
        [flow]
    );

    const renderedFlow = React.useMemo(() => {
        return flow.map((step) => {
            return renderFlow(step, wrapper);
        });
    }, [flow]);

    const wrapperClasses = React.useMemo(() => {
        let result = styles.taskWrapper;
        if (highlightIncomplete && !wrapper.complete) {
            result += ` ${styles.taskWrapperIncomplete}`;
        }
        return result;
    }, [wrapper, highlightIncomplete]);

    return (
        <div className={wrapperClasses}>
            <div className={styles.tasksTopHeader}>
                <IconButton
                    title="Copy"
                    onClick={onCopy}
                    styles={{ root: { height: '25px' } }}
                    iconProps={{ iconName: 'Copy' }}
                />
                <IconButton
                    title="Delete"
                    onClick={onDelete}
                    styles={{ root: { height: '25px' } }}
                    iconProps={{ iconName: 'Cancel' }}
                />
            </div>
            <div className={styles.taskSteps}>{renderedFlow}</div>
        </div>
    );
};

export const CreateTasks: React.FC = () => {
    const { TaskService } = React.useContext(GlobalContext);
    const [errorMessage, setErrorMessage] = React.useState('');
    const [highlightIncomplete, setHighlightIncomplete] = React.useState(false);
    const [createdTasks, setCreatedTasks] = React.useState<ICreateTaskWrapper[]>([
        createBlankTaskWizard(),
    ]);

    const handleAddNewTask = () => {
        setCreatedTasks((prev) => [...prev, createBlankTaskWizard()]);
    };

    const handleUpdate = (idx: number) => (wrapper: ICreateTaskWrapper) => {
        setCreatedTasks((prev) =>
            calculateComplete([...prev.slice(0, idx), wrapper, ...prev.slice(idx + 1)])
        );
    };

    const handleCopy = (idx: number) => () => {
        setCreatedTasks((prev) => {
            const clone = [...prev];
            clone.splice(idx, 0, cloneDeep(prev[idx]));
            return clone;
        });
    };

    const handleDelete = (idx: number) => () => {
        setCreatedTasks((prev) => {
            const clone = [...prev];
            clone.splice(idx, 1);
            return clone;
        });
    };

    const handleSave = async (): Promise<void> => {
        const incomplete = createdTasks.filter((w) => !w.complete);
        if (incomplete.length > 0) {
            setErrorMessage('Not all required info filled in');
            setHighlightIncomplete(true);
            return null;
        }
        const creation = TaskService.createTasks(createdTasks.map((w) => w.task));
        closePanel('SP_TASKS');
        await creation;
        SPnotify({
            message: 'Tasks successfully created',
            messageType: MessageBarType.success,
        });
    };

    const tasks = createdTasks.map((task, idx) => (
        <TaskWizard
            key={idx}
            wrapper={task}
            onCopy={handleCopy(idx)}
            onDelete={handleDelete(idx)}
            onUpdate={handleUpdate(idx)}
            highlightIncomplete={highlightIncomplete}
        />
    ));

    /**
     * Set panel properties
     */
    React.useEffect(() => {
        setPanelProperties('SP_TASKS', {
            isFooterAtBottom: true,
            onRenderFooterContent: () => (
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
    }, [createdTasks]);

    return (
        <div className={styles.container}>
            {errorMessage && (
                <MessageBar messageBarType={MessageBarType.error}>
                    {errorMessage}
                </MessageBar>
            )}
            {tasks}
            <ActionButton
                className={styles.addNewButton}
                onClick={handleAddNewTask}
                iconProps={{ iconName: 'Add' }}
            >
                Add task
            </ActionButton>
        </div>
    );
};
