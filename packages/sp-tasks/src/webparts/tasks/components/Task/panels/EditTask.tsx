import { DateTime } from 'luxon';
import { DefaultButton, MaskedTextField, MessageBar, MessageBarType, PrimaryButton, TextField } from 'office-ui-fabric-react';
import * as React from 'react';
import { closePanel, setPanelProperties } from '../../../hooks/usePanel';
import { updateTask } from '../../../hooks/useTasks';
import ITask from '../../../models/ITask';
import GlobalContext from '../../../utils/GlobalContext';
import { maskFormat } from '../../../utils/utils';
import { UserPicker } from '../../user-selector/UserPicker';

export interface IEditTaskProps {
    taskId: number;
}

export const EditTask: React.FC<IEditTaskProps> = (props) => {
    const { TaskService } = React.useContext(GlobalContext);
    const [, setTask] = React.useState<ITask>(null);
    const [info, setInfo] = React.useState({
        Title: '',
        Description: '',
        AssignedToId: 0,
        Time: '',
    });

    React.useEffect(() => {
        TaskService.getTask(props.taskId).then((task) => {
            setTask(task);
            setInfo({
                Title: task.Title,
                Description: task.Description,
                AssignedToId: task.AssignedTo.ID,
                Time: DateTime.fromISO(task.Time).toFormat('HH:mm'),
            });
        });
    }, []);

    /**
     * Update Footer every time info changes
     */
    React.useEffect(() => {
        setPanelProperties('SP_TASKS', {
            isFooterAtBottom: true,
            onRenderFooterContent: (_props) => (
                <>
                    <PrimaryButton
                        onClick={async () => {
                            await TaskService.updateTask(props.taskId, {
                                ...info,
                                Time: DateTime.fromISO(info.Time).toISO(),
                            });
                            closePanel('SP_TASKS');
                            updateTask(await TaskService.getTask(props.taskId));
                        }}
                    >
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
    }, [info]);

    const handleEdit = (prop: string) => (_evt: any, value: string) => {
        setInfo((prev) => ({
            ...prev,
            [prop]: value,
        }));
    };

    return (
        <div>
            <MessageBar messageBarType={MessageBarType.info}>
                <b>Important</b>: all modifications will be applied only to <b>tasks created in the future</b>. If you need to modify a task that was already created, use option <b>Edit task (current date only)</b>
            </MessageBar>
            <TextField label="Title" value={info.Title} onChange={handleEdit('Title')} />
            <TextField
                label="Description"
                value={info.Description}
                multiline
                autoAdjustHeight
                resizable={false}
                onChange={handleEdit('Description')}
            />
            <UserPicker
                label="Assigned to"
                inputId="SP_TASKS_ASSIGNED_TO"
                selectedUserId={info.AssignedToId}
                onChange={(id) =>
                    setInfo((prev) => ({
                        ...prev,
                        AssignedToId: id,
                    }))
                }
            />
            <MaskedTextField
                label="Time (24h format)"
                value={info.Time}
                mask="hH:mM"
                maskFormat={maskFormat}
                onChange={handleEdit('Time')}
            />
        </div>
    );
};
