import {
    ComboBox,
    CompactPeoplePicker,
    DatePicker,
    DefaultButton,
    Dropdown,
    Label,
    MessageBar,
    MessageBarType,
    Panel,
    PanelType,
    Position,
    PrimaryButton,
    Separator,
    SpinButton,
    Stack,
    StackItem,
    TextField,
} from 'office-ui-fabric-react';
import * as React from 'react';
import { useNavigate, useParams } from 'react-router';
import { useActions } from '../../comments/useActions';
import { HoursInput } from '../../components/HoursInput';
import { loadingStart, loadingStop } from '../../components/Utils/LoadingAnimation';
import { useUsers } from '../../users/useUsers';
import { tasksAdded, taskUpdated } from '../../utils/dom-events';
import { GlobalContext } from '../../utils/GlobalContext';
import { useChoiceFields } from '../../utils/useChoiceFields';
import { ICreateTask } from '../ICreateTask';
import { useGroups } from '../table/useGroups';
import { useTasks } from '../useTasks';

const CreateTaskPanel: React.FC = () => {
    const { teams } = React.useContext(GlobalContext);
    const { createTask, createSubtask, getTask, getSubtasks } = useTasks();
    const { addAction } = useActions();
    const navigate = useNavigate();
    const params = useParams();

    /** Group labels */
    const { groupLabels, setGroupLabels } = useGroups();
    const groupOptions = React.useMemo(() => {
        if (!groupLabels) return [];
        return ['NA', ...groupLabels].map((label) => ({
            key: label,
            text: label,
        }));
    }, [groupLabels]);

    /** Priority options */
    const priorityChoice = useChoiceFields('Priority');
    const choises = React.useMemo(() => {
        if (!priorityChoice.fieldInfo) return [];
        return priorityChoice.fieldInfo.Choices.map((choise) => ({
            key: choise,
            text: choise,
        }));
    }, [priorityChoice.fieldInfo]);

    const [parent, setParent] = React.useState(null);

    /** Created task data */
    const [data, setData] = React.useState<ICreateTask>({
        Title: '',
        Description: '',
        DueDate: new Date().toISOString(),
        EstimatedTime: 0,
        Priority: 'None',
        Category: 'NA',
        ResponsibleId: 0,
        Team: '',
        Subtasks: 0,
        FinishedSubtasks: 0,
    });

    /** Team options */
    const teamsOptions = React.useMemo(() => {
        return teams.map((team) => ({
            key: team,
            text: team,
        }));
    }, [teams]);

    const handleSetTextField = (field: keyof ICreateTask) => (_ev: any, val: any) => {
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
            const personas = await getPersonaProps();
            setUsers(personas);
            /** If parent present, load it's data and set as default values */
            if (params.parentId) {
                const parent = await getTask(+params.parentId);
                setParent(parent);
                setData((prev) => ({
                    ...prev,
                    ResponsibleId: parent.Responsible.Id,
                    Priority: parent.Priority,
                    DueDate: parent.DueDate,
                    Category: parent.Category,
                    Team: parent.Team,
                }));
            } else {
                setData((prev) => ({
                    ...prev,
                    ResponsibleId:
                        +personas.find((p) => p.text === 'Everyone').id || 0,
                }));
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

    const handleDismissPanel = React.useCallback(() => navigate('/'), []);

    /** Task creation */
    const handleCreateTask = React.useCallback(
        async (ev: React.FormEvent) => {
            handleDismissPanel();
            loadingStart('default');
            ev.preventDefault();
            if (!validateData()) return;
            if (params.parentId) {
                const parent = await getTask(+params.parentId);
                const subtaskId = await createSubtask(data, parent);
                await addAction(subtaskId, 'Created', data.Title);
                parent.Subtasks += 1;
                // Refresh the parent task
                const subtasks = await getSubtasks(parent);
                taskUpdated(parent);
                tasksAdded(subtasks);
            } else {
                const createdId = await createTask(data);
                await addAction(createdId, 'Created', data.Title);
                tasksAdded([await getTask(createdId)]);
            }
            loadingStop('default');
        },
        [data, validateData]
    );

    return (
        <Panel
            isOpen={true}
            onDismiss={handleDismissPanel}
            type={PanelType.medium}
            isLightDismiss
            headerText="Create task"
            isFooterAtBottom
            onRenderFooterContent={() => (
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
            )}
        >
            {messages.length > 0 && (
                <MessageBar messageBarType={MessageBarType.blocked}>
                    {messages.map((message) => (
                        <div> - {message}</div>
                    ))}
                </MessageBar>
            )}
            <form onSubmit={handleCreateTask} id="create-task-form">
                {/* Title & Description */}
                <Stack tokens={{ childrenGap: 10 }}>
                    <StackItem grow={1}>
                        <TextField
                            label="Title"
                            required
                            onChange={handleSetTextField('Title')}
                        />
                    </StackItem>
                    <StackItem style={{ width: '100%' }}>
                        <TextField
                            label="Description"
                            multiline
                            onChange={handleSetTextField('Description')}
                            resizable={false}
                            autoAdjustHeight
                        />
                    </StackItem>
                </Stack>

                <Separator />

                {/* Responsible */}
                <Stack horizontal tokens={{ childrenGap: 10 }}>
                    <StackItem style={{ width: '75%' }}>
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
                            selectedItems={users.filter(
                                (u) => +u.id === data.ResponsibleId
                            )}
                            onChange={(items) =>
                                setData((prev) => ({
                                    ...prev,
                                    ResponsibleId: +items[0]?.id,
                                }))
                            }
                        />
                    </StackItem>
                    <StackItem grow={1}>
                        <Dropdown
                            label="Team"
                            options={teamsOptions}
                            selectedKey={data['Team']}
                            onChange={(evt, option) =>
                                setData((prev) => ({
                                    ...prev,
                                    Team: option.text,
                                }))
                            }
                        />
                    </StackItem>
                </Stack>

                <Separator />

                <Stack horizontal tokens={{ childrenGap: 10 }}>
                    {/* Start & Due Dates */}
                    <Stack style={{ width: '45%' }}>
                        <StackItem grow={1}>
                            <DatePicker
                                label="Start date"
                                value={
                                    data.StartDate && new Date(data.StartDate)
                                }
                                onSelectDate={handleSelectDateField(
                                    'StartDate'
                                )}
                            />
                        </StackItem>
                        <StackItem>
                            <DatePicker
                                label="Due date"
                                value={new Date(data.DueDate)}
                                isRequired
                                onSelectDate={handleSelectDateField('DueDate')}
                            />
                        </StackItem>
                    </Stack>

                    <Separator vertical style={{ height: '100%' }} />

                    {/* Priority & Category */}
                    <Stack
                        style={{ width: '45%' }}
                        tokens={{ childrenGap: 10 }}
                    >
                        <StackItem>
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
                        {/* Show category only if there is no parent */}
                        {!Boolean(params.parentId) ? (
                            <StackItem>
                                <ComboBox
                                    label="Category"
                                    options={groupOptions}
                                    useComboBoxAsMenuWidth
                                    autoComplete="on"
                                    allowFreeform
                                    selectedKey={data.Category}
                                    onChange={(evt, option) => {
                                        let category: string =
                                            option?.key as string;
                                        /** New category added */
                                        if (!category) {
                                            const target: any = evt.target;
                                            category = target.value as string;
                                            setGroupLabels((prev) => [
                                                ...prev,
                                                category,
                                            ]);
                                        }
                                        setData((prev) => ({
                                            ...prev,
                                            Category: category,
                                        }));
                                    }}
                                />
                            </StackItem>
                        ) : null}
                    </Stack>
                </Stack>

                <Separator />

                {/* Estimated time */}
                <Stack>
                    <HoursInput
                        value={data.EstimatedTime}
                        onChange={(val) =>
                            setData((prev) => ({
                                ...prev,
                                EstimatedTime: val,
                            }))
                        }
                        label="Estimated duration"
                        buttons={[
                            {
                                key: '+.25',
                                value: 0.25,
                                label: '+15m',
                            },
                            {
                                key: '+.5',
                                value: 0.5,
                                label: '+30m',
                            },
                            {
                                key: '+1',
                                value: 1,
                                label: '+1h',
                            },
                            {
                                key: '+5',
                                value: 5,
                                label: '+5h',
                            },
                            {
                                key: '+10',
                                value: 10,
                                label: '+10h',
                            },
                            {
                                key: '-.25',
                                value: -0.25,
                                label: '-15m',
                            },
                            {
                                key: '-.5',
                                value: -0.5,
                                label: '-30m',
                            },
                            {
                                key: '-1',
                                value: -1,
                                label: '-1h',
                            },
                            {
                                key: '-5',
                                value: -5,
                                label: '-5h',
                            },
                            {
                                key: '-10',
                                value: -10,
                                label: '-10h',
                            },
                        ]}
                    />
                </Stack>
                {params.parentId && (
                    <TextField
                        label="Parent task"
                        value={parent?.Title}
                        readOnly
                    />
                )}
            </form>
        </Panel>
    );
};

export default CreateTaskPanel;
