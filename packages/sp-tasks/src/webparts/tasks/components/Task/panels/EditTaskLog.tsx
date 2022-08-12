import { DateTime } from 'luxon';
import { DefaultButton, MaskedTextField, MessageBar, MessageBarType, PrimaryButton, TextField } from 'office-ui-fabric-react';
import * as React from 'react';
import { closePanel, setPanelProperties } from '../../../hooks/usePanel';
import { updateTaskLog } from '../../../hooks/useTasks';
import ITaskLog from '../../../models/ITaskLog';
import GlobalContext from '../../../utils/GlobalContext';
import { maskFormat } from '../../../utils/utils';
import { UserPicker } from '../../user-selector/UserPicker';

export interface IEditTaskProps {
    taskId: number;
}

export const EditTaskLog: React.FC<IEditTaskProps> = (props) => {
    const { TaskLogsService } = React.useContext(GlobalContext);
    const [, setTask] = React.useState<ITaskLog>(null);
    const [info, setInfo] = React.useState({
        Title: '',
        Remark: '',
        UserId: 0,
        Time: '',
    });

    React.useEffect(() => {
        TaskLogsService.getTaskLog(props.taskId).then((task) => {
            setTask(task);
            setInfo({
                Title: task.Title,
                Remark: task.Remark,
                UserId: task.User.ID,
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
                            await TaskLogsService.updateTaskLog(props.taskId, {
                                ...info,
                                Time: DateTime.fromISO(info.Time).toISO(),
                            });
                            closePanel('SP_TASKS');
                            updateTaskLog(await TaskLogsService.getTaskLog(props.taskId));
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
                <b>Important</b>: Changes will apply only to <b>current task</b> instance. All other tasks will remain unmodified. If you need to modify future created tasks as well, use option <b>'Edit task (all future dates)'</b>
            </MessageBar>
            <TextField label="Title" value={info.Title} onChange={handleEdit('Title')} />
            <TextField
                label="Remark"
                multiline
                autoAdjustHeight
                resizable={false}
                value={info.Remark}
                onChange={handleEdit('Remark')}
            />
            <UserPicker
                label="Assigned to"
                inputId="SP_TASKS_ASSIGNED_TO"
                selectedUserId={info.UserId}
                onChange={(id) =>
                    setInfo((prev) => ({
                        ...prev,
                        UserId: id,
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
