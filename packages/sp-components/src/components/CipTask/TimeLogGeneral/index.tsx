import { ITaskOverview } from '@service/sp-cip/dist/models/ITaskOverview';
import { IAction } from '@service/sp-cip/dist/services/action-service';
import { Checkbox, CompactPeoplePicker, DatePicker, IPersonaProps, Label, MessageBar, MessageBarType, PrimaryButton, TextField } from 'office-ui-fabric-react';
import * as React from 'react';
import { HoursInput } from '../../HoursInput';
import { TaskPicker } from '../TaskPicker';
import styles from './TimeLogGeneral.module.scss';

export interface ITimeLogGeneralProps {
    task?: ITaskOverview;
    action?: IAction;
    users?: IPersonaProps[];
    tasks?: ITaskOverview[];
    disabled?: boolean;
    currentUserId?: number;
    /* initial hours value */
    time?: number;
    /* initial comment value */
    description?: string;
    /* Events */
    beforeActions?: () => void;
    onActionAdd?: (action: Partial<IAction>) => void;
    onActionEdit?: (actionId: number, update: Partial<IAction>) => void;
    onTaskEffectiveTimeChange?: (taskId: number, time: number) => void;
    afterActions?: () => void;
}

const setDateCurrentTime = (dt: Date): Date => {
    const now = new Date();
    dt.setHours(now.getHours());
    dt.setMinutes(now.getMinutes());
    dt.setSeconds(now.getSeconds());
    return dt;
};

export const TimeLogGeneral: React.FC<ITimeLogGeneralProps> = (props) => {
    const [selected, setSelected] = React.useState<ITaskOverview>(props.task);
    const [time, setTime] = React.useState(props.time || 0);
    const [comment, setComment] = React.useState(props.description || '');
    const [errorMessage, setErrorMessage] = React.useState('');
    const [diffDate, setDiffDate] = React.useState(false);
    const [date, setDate] = React.useState<Date>(null);
    const [diffPerson, setDiffPerson] = React.useState(false);
    const [selectedUser, setSelectedUser] = React.useState<IPersonaProps[]>([]);

    React.useEffect(() => {
        async function checkAction(): Promise<void> {
            if (props.action) {
                const indexPipe = props.action.Comment.indexOf('|');
                setTime(
                    Number.parseFloat(props.action.Comment.substring(0, indexPipe))
                );
                setComment(props.action.Comment.substring(indexPipe + 1));
            }
        }
        checkAction().catch((err) => console.error(err));
    }, [props.action]);

    // New action - has selected task
    const handleLogNew = async (): Promise<void> => {
        const selId = selected?.Id || null;
            await props.onActionAdd({
                ActivityType: 'Time log',
                Comment: `${time}|${comment}`,
                UserId: diffPerson ? +selectedUser[0].id : props.currentUserId,
                Date: date ? setDateCurrentTime(date).toISOString() : new Date().toISOString(),
            }
        );
        if (selId) {
            props.onTaskEffectiveTimeChange(selId, time);
        }
    };

    // Already existing action log, update it
    // And also update the task with the delta
    const handleLogUpdate = async (): Promise<void> => {
        const indexOfPipe = props.action.Comment.indexOf('|');
        let dt = props.action.Date ? props.action.Date : props.action.Created;
        if (date) {
            dt = setDateCurrentTime(date).toISOString();
        }
        await props.onActionEdit(props.action.Id, {
            Comment: `${time}|${comment}`,
            UserId: selectedUser.length > 0 ? +selectedUser[0].id : props.action.User.Id,
            Date: dt,
        })
        if (props.task) {
            const delta =
                Number.parseFloat(props.action.Comment.substring(0, indexOfPipe)) -
                time;
            props.onTaskEffectiveTimeChange(props.task.Id, -delta);
        }
    };

    const handleLogTime = async (): Promise<void> => {
        // No time was registered
        if (time <= 0) {
            setErrorMessage('Time cannot be 0');
            return;
        }
        if (props.beforeActions) {
            await props.beforeActions();
        }
        let action;
        if (!props.action) {
            action = handleLogNew();
        } else {
            action = handleLogUpdate();
        }
        await action;
        if (props.afterActions) {
            await props.afterActions();
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
            <TaskPicker
                id="select-main-task"
                selectedTask={selected}
                disabled={Boolean(props.disabled)}
                onTaskSelected={(task) => setSelected(task)}
                tasks={props.tasks ?? []}
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
                            onResolveSuggestions={(filter: string) => props.users.filter((u) => u.text.toLowerCase().includes(filter.toLowerCase()))}
                            onEmptyResolveSuggestions={() => props.users}
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
