import {
    Label,
    MessageBar,
    MessageBarType,
    PrimaryButton,
    TextField,
} from 'office-ui-fabric-react';
import * as React from 'react';
import { IAction, useActions } from '../../comments/useActions';
import { ITaskOverview } from '../../tasks/ITaskOverview';
import { useTasks } from '../../tasks/useTasks';
import { taskUpdated } from '../../utils/dom-events';
import { DIALOG_IDS, dismissDialog } from '../AlertDialog';
import { HoursInput } from '../HoursInput';
import { SelectMainTask } from '../SelectMainTask';
import { loadingStart, loadingStop } from '../utils/LoadingAnimation';
import styles from './TimeLogGeneral.module.scss';

export interface ITimeLogGeneralProps {
    dialogId: DIALOG_IDS;
    task?: ITaskOverview;
    action?: IAction;
}

export const TimeLogGeneral: React.FC<ITimeLogGeneralProps> = (props) => {
    const { getTask, updateTask } = useTasks();
    const { getAction, addAction, updateAction } = useActions();
    const [selected, setSelected] = React.useState<ITaskOverview>(props.task);
    const [time, setTime] = React.useState(0);
    const [comment, setComment] = React.useState('');
    const [errorMessage, setErrorMessage] = React.useState('');

    React.useEffect(() => {
        async function checkAction() {
            if (props.action) {
                const action = await getAction(props.action.Id);
                const indexPipe = action.Comment.indexOf('|');
                setTime(
                    Number.parseFloat(action.Comment.substring(0, indexPipe))
                );
                setComment(action.Comment.substring(indexPipe + 1));
            }
        }
        checkAction();
    }, [props.action]);

    // New action - has selected task
    const handleLogNew = async () => {
        const selId = selected.Id || null;
        await addAction(selId, 'Time log', `${time}|${comment}`);
        if (selId) {
            await updateTask(props.task.Id, {
                EffectiveTime: props.task.EffectiveTime + time,
            });
            taskUpdated(await getTask(selId));
        }
    }
    
    // Already existing action log, update it
    // And also update the task with the delta 
    const handleLogUpdate = async () => {
        const indexOfPipe = props.action.Comment.indexOf('|');
        const delta = Number.parseFloat(props.action.Comment.substring(0, indexOfPipe)) - time;
        const action = await updateAction(props.action.Id, {
            Comment: `${time}|${comment}`,
        });
        const updateTaskAction = await updateTask(props.task.Id, {
            EffectiveTime: props.task.EffectiveTime - delta,
        });
        taskUpdated(await getTask(props.task.Id));

        return Promise.all([action, updateTaskAction]);
    };

    const handleLogTime = async () => {
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
        dismissDialog(props.dialogId);
        loadingStart();
        await action;
        loadingStop();
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
            <PrimaryButton className={styles.logButton} onClick={handleLogTime}>
                Log
            </PrimaryButton>
        </div>
    );
};
