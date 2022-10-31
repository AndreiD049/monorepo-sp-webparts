import {
    Checkbox,
    CompactPeoplePicker,
    DatePicker,
    IPersonaProps,
    Label,
    MessageBar,
    MessageBarType,
    PrimaryButton,
    TextField,
} from 'office-ui-fabric-react';
import * as React from 'react';
import { actionUpdated } from '../../actionlog/ActionLog';
import { taskUpdated } from '../../utils/dom-events';
import { DIALOG_IDS, dismissDialog } from '../AlertDialog';
import { HoursInput } from '../HoursInput';
import { SelectMainTask } from '../SelectMainTask';
import { loadingStart, loadingStop } from '../utils/LoadingAnimation';
import MainService from '../../services/main-service';
import { ITaskOverview } from '@service/sp-cip/dist/models/ITaskOverview';
import { IAction } from '@service/sp-cip/dist/services/action-service';
import { GlobalContext } from '../../utils/GlobalContext';
import styles from './TimeLogGeneral.module.scss';
import { IItemUpdateResult } from 'sp-preset';
import { hideDialog } from 'sp-components';

export interface ITimeLogGeneralProps {
    dialogId: string;
    task?: ITaskOverview;
    action?: IAction;
    /* initial hours value */
    time?: number;
    /* initial comment value */
    description?: string;
    afterLog?: () => void;
}

const setDateCurrentTime = (dt: Date): Date => {
    const now = new Date();
    dt.setHours(now.getHours());
    dt.setMinutes(now.getMinutes());
    dt.setSeconds(now.getSeconds());
    return dt;
};

export const TimeLogGeneral: React.FC<ITimeLogGeneralProps> = (props) => {
    const { currentUser } = React.useContext(GlobalContext);
    const taskService = MainService.getTaskService();
    const actionService = MainService.getActionService();
    const userService = MainService.getUserService();
    const [selected, setSelected] = React.useState<ITaskOverview>(props.task);
    const [time, setTime] = React.useState(props.time || 0);
    const [comment, setComment] = React.useState(props.description || '');
    const [errorMessage, setErrorMessage] = React.useState('');
    const [diffDate, setDiffDate] = React.useState(false);
    const [date, setDate] = React.useState<Date>(null);
    const [diffPerson, setDiffPerson] = React.useState(false);
    const [selectedUser, setSelectedUser] = React.useState<IPersonaProps[]>([]);
    const [users, setUsers] = React.useState<IPersonaProps[]>([]);

    React.useEffect(() => {
        async function run(): Promise<void> {
            setUsers(await userService.getPersonaProps());
        }
        if (diffPerson) {
            run().catch((err) => console.error(err));
        }
    }, [diffPerson]);

    React.useEffect(() => {
        async function checkAction(): Promise<void> {
            if (props.action) {
                const action = await actionService.getAction(props.action.Id);
                const indexPipe = action.Comment.indexOf('|');
                setTime(
                    Number.parseFloat(action.Comment.substring(0, indexPipe))
                );
                setComment(action.Comment.substring(indexPipe + 1));
            }
        }
        checkAction().catch((err) => console.error(err));
    }, [props.action]);

    // New action - has selected task
    const handleLogNew = async (): Promise<void> => {
        const selId = selected?.Id || null;
        await actionService.addAction(
            selId,
            'Time log',
            `${time}|${comment}`,
            selectedUser?.length > 0 ? +selectedUser[0].id : currentUser.Id,
            date ? setDateCurrentTime(date).toISOString() : new Date().toISOString()
        );
        if (selId) {
            const task = props.task || (await taskService.getTask(selId));
            await taskService.updateTask(selId, {
                EffectiveTime: task.EffectiveTime + time,
            });
            taskUpdated(await taskService.getTask(selId));
        }
    };

    // Already existing action log, update it
    // And also update the task with the delta
    const handleLogUpdate = async (): Promise<[IItemUpdateResult, void]> => {
        const indexOfPipe = props.action.Comment.indexOf('|');
        let dt = props.action.Date ? props.action.Date : props.action.Created;
        if (date) {
            dt = setDateCurrentTime(date).toISOString();
        }
        const action = await actionService.updateAction(props.action.Id, {
            Comment: `${time}|${comment}`,
            UserId: selectedUser.length > 0 ? +selectedUser[0].id : props.action.User.Id,
            Date: dt,
        });
        let updateTaskAction;
        if (props.task) {
            const delta =
                Number.parseFloat(props.action.Comment.substring(0, indexOfPipe)) -
                time;
            updateTaskAction = await taskService.updateTask(props.task.Id, {
                EffectiveTime: props.task.EffectiveTime - delta,
            });
            taskUpdated(await taskService.getTask(props.task.Id));
        }
        actionUpdated(await actionService.getAction(props.action.Id));

        return Promise.all([action, updateTaskAction]);
    };

    const handleLogTime = async (): Promise<void> => {
        try {
            // No time was registered
            if (time <= 0) {
                setErrorMessage('Time cannot be 0');
                return;
            }
            let action;
            if (!props.action) {
                action = handleLogNew();
            } else {
                action = handleLogUpdate();
            }
            hideDialog(props.dialogId);
            loadingStart();
            await action;
            // eslint-disable-next-line no-unused-expressions
            props.afterLog && props.afterLog()
        } finally {
            loadingStop();
        }
    };

    return (
        <div className={styles.container}>
            {errorMessage && (
                <MessageBar
                    messageBarType={MessageBarType.error}
                    onDismiss={() => setErrorMessage('')}
                >
                    {errorMessage}
                </MessageBar>
            )}
            <Label htmlFor="select-main-task">Task:</Label>
            <SelectMainTask
                id="select-main-task"
                selectedTask={selected}
                onTaskSelected={(task) => setSelected(task)}
                tasks={selected ? [selected] : null}
            />
            <HoursInput
                value={time}
                label="Hours: "
                onChange={(val) => setTime(val)}
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
                ]}
            />
            <TextField
                label="Comment"
                value={comment}
                onChange={(ev, value) => setComment(value)}
                multiline
                resizable={false}
                autoAdjustHeight
            />
            <div className={styles.diffBlock}>
                <Checkbox label="Different date" checked={diffDate} onChange={(_ev, checked) => setDiffDate(checked)} />
                {
                    diffDate && (<DatePicker value={date} onSelectDate={(dt) => setDate(dt)} className={styles.diffBlockInput} />)
                }
            </div>
            <div className={styles.diffBlock}>
                <Checkbox label="Different person" checked={diffPerson} onChange={(_ev, checked) => setDiffPerson(checked)} />
                {
                    diffPerson && (
                        <CompactPeoplePicker
                            className={styles.diffBlockInput} 
                            itemLimit={1}
                            inputProps={{ id: 'ResponsiblePicker' }}
                            onResolveSuggestions={(filter: string) => users.filter((u) => u.text.toLowerCase().includes(filter.toLowerCase()))}
                            onEmptyResolveSuggestions={() => users}
                            selectedItems={selectedUser}
                            onChange={(items) => setSelectedUser(items)}
                        />
                    )
                }
            </div>
            <PrimaryButton className={styles.logButton} onClick={handleLogTime}>
                Log
            </PrimaryButton>
        </div>
    );
};
