import {
    CompactPeoplePicker,
    DatePicker,
    DefaultButton,
    Dropdown,
    Label,
    MessageBar,
    MessageBarType,
    Position,
    PrimaryButton,
    Separator,
    SpinButton,
    Stack,
    StackItem,
    TextField,
} from 'office-ui-fabric-react';
import * as React from 'react';
import { CREATE_PANEL_ID } from '../../components/useCipPanels';
import { IPanelComponentProps } from '../../components/usePanel';
import { useUsers } from '../../users/useUsers';
import {
    PANEL_OPEN_EVT,
    REFRESH_PARENT_EVT,
    REFRESH_SUBTASKS_EVT,
    REFRESH_TASK_EVT,
} from '../../utils/constants';
import { nodeRefreshTask } from '../../utils/dom-events';
import { useChoiceFields } from '../../utils/useChoiceFields';
import { ICreateTask } from '../ITaskDetails';
import { useTasks } from '../useTasks';

export interface ICreateTaskProps {
    parentId?: number;
}

const CreateTaskPanel: React.FC<IPanelComponentProps & ICreateTaskProps> = (
    props
) => {
    const { fieldInfo } = useChoiceFields('Priority');
    const { createTask, createSubtask, getTask } = useTasks();

    const choises = React.useMemo(() => {
        if (!fieldInfo) return [];
        return fieldInfo.Choices.map((choise) => ({
            key: choise,
            text: choise,
        }));
    }, [fieldInfo]);

    /** Created task data */
    const [parent, setParent] = React.useState(null);

    const [data, setData] = React.useState<ICreateTask>({
        Title: '',
        Description: '',
        DueDate: new Date().toISOString(),
        EstimatedTime: 0,
        Priority: 'None',
        ResponsibleId: 0,
    });

    const handleSetTextField = (field: keyof ICreateTask) => (_ev, val) => {
        setData((prev) => ({
            ...prev,
            [field]: val,
        }));
    };

    const handleSelectDateField = (field: keyof ICreateTask) => (val: Date) => {
        setData((prev) => ({
            ...prev,
            [field]: val.toISOString(),
        }));
    };

    /** Responsible */
    const { getPersonaProps } = useUsers();
    const [users, setUsers] = React.useState([]);

    React.useEffect(() => {
        (async function () {
            setUsers(await getPersonaProps());
            if (props.parentId) {
                setParent(await getTask(props.parentId));
            } else {
                setParent(null);
            }
        })();
        () => setParent(null);
    }, []);

    /** Data validation */
    const [messages, setMessages] = React.useState([]);
    const validateData = React.useCallback(() => {
        const messages = [];
        if (data.Title === '') messages.push(`'Title' is a required field`);
        if (data.ResponsibleId <= 0)
            messages.push(`'Responsible' is a required field`);
        if (data.EstimatedTime <= 0)
            messages.push(`'Estimated duaration' is should be specified`);
        if (messages.length > 0) {
            setMessages(messages);
            return false;
        } else {
            return true;
        }
    }, [data]);

    const handleDismissPanel = React.useCallback(() => {
        document.dispatchEvent(new CustomEvent(PANEL_OPEN_EVT, {
            detail: {
                id: CREATE_PANEL_ID,
                open: false,
            }
        }));
    }, []);

    const handleCreateTask = React.useCallback(
        async (ev: React.FormEvent) => {
            ev.preventDefault();
            if (!validateData()) return;
            if (props.parentId) {
                await createSubtask(data, parent);
                // Refresh the parent task
                nodeRefreshTask(props.parentId);
                // Refresh the subtasks
                document.dispatchEvent(
                    new CustomEvent(REFRESH_SUBTASKS_EVT, {
                        detail: {
                            parentId: props.parentId,
                        },
                    })
                );
            } else {
                await createTask(data);
                document.dispatchEvent(new CustomEvent(REFRESH_PARENT_EVT));
            }
            handleDismissPanel();
        },
        [data, validateData]
    );

    React.useEffect(() => {
        props.setFooter(
            <>
                <PrimaryButton
                    style={{ marginRight: '.5em' }}
                    type="submit"
                    form="create-task-form"
                >
                    Create
                </PrimaryButton>
                <DefaultButton onClick={handleDismissPanel}>
                    Cancel
                </DefaultButton>
            </>
        );
    }, [handleCreateTask]);

    return (
        <>
            {messages.length > 0 && (
                <MessageBar messageBarType={MessageBarType.blocked}>
                    {messages.map((message) => (
                        <div> - {message}</div>
                    ))}
                </MessageBar>
            )}
            <form onSubmit={handleCreateTask} id="create-task-form">
                <Stack horizontal tokens={{ childrenGap: 10 }}>
                    <StackItem grow={1}>
                        <TextField
                            label="Title"
                            required
                            onChange={handleSetTextField('Title')}
                        />
                    </StackItem>
                    <StackItem style={{ width: '50%' }}>
                        <TextField
                            label="Description"
                            multiline
                            onChange={handleSetTextField('Description')}
                        />
                    </StackItem>
                </Stack>

                <Separator />

                <Stack horizontal tokens={{ childrenGap: 10 }}>
                    <StackItem grow={1}>
                        <Label required htmlFor="ResponsiblePicker">
                            Responsible
                        </Label>
                        <CompactPeoplePicker
                            itemLimit={1}
                            inputProps={{ id: 'ResponsiblePicker' }}
                            onResolveSuggestions={(filter: string) =>
                                users.filter(
                                    (user) =>
                                        user.text
                                            .toLowerCase()
                                            .indexOf(filter.toLowerCase()) > -1
                                )
                            }
                            onEmptyResolveSuggestions={() => users}
                            onChange={(items) =>
                                setData((prev) => ({
                                    ...prev,
                                    ResponsibleId: +items[0]?.id,
                                }))
                            }
                        />
                    </StackItem>
                    <StackItem style={{ width: '50%' }}>
                        <Dropdown
                            label="Priority"
                            options={choises}
                            selectedKey={data.Priority}
                            onChange={(_ev, option) =>
                                setData((prev) => ({
                                    ...prev,
                                    Priority: option.text,
                                }))
                            }
                        />
                    </StackItem>
                </Stack>

                <Separator />

                <Stack horizontal tokens={{ childrenGap: 10 }}>
                    <StackItem grow={1}>
                        <DatePicker
                            label="Start date"
                            value={data.StartDate && new Date(data.StartDate)}
                            onSelectDate={handleSelectDateField('StartDate')}
                        />
                    </StackItem>
                    <StackItem style={{ width: '50%' }}>
                        <DatePicker
                            label="Due date"
                            value={new Date(data.DueDate)}
                            isRequired
                            onSelectDate={handleSelectDateField('DueDate')}
                        />
                    </StackItem>
                </Stack>

                <Separator />

                <Label htmlFor="DurationSpinButton" required>
                    Estimated duaration
                </Label>
                <SpinButton
                    labelPosition={Position.top}
                    min={0}
                    inputProps={{ id: 'DurationSpinButton' }}
                    value={data.EstimatedTime.toString()}
                    onIncrement={(val) =>
                        setData((prev) => ({
                            ...prev,
                            EstimatedTime: +val + 1,
                        }))
                    }
                    onDecrement={(val) =>
                        setData((prev) => ({
                            ...prev,
                            EstimatedTime: +val - 1,
                        }))
                    }
                    onValidate={(val: string) =>
                        setData((prev) => ({
                            ...prev,
                            EstimatedTime: +val,
                        }))
                    }
                />
                {props.parentId && (
                    <TextField
                        label="Parent task"
                        value={parent?.Title}
                        readOnly
                    />
                )}
            </form>
        </>
    );
};

export default CreateTaskPanel;
