import { PrimaryButton } from 'office-ui-fabric-react';
import * as React from 'react';
import { useActions } from '../../comments/useActions';
import { dismissDialog } from '../../components/AlertDialog';
import { HoursInput } from '../../components/HoursInput';
import { loadingStart, loadingStop } from '../../components/Utils/LoadingAnimation';
import { taskUpdated } from '../../utils/dom-events';
import { ITaskOverview } from '../ITaskOverview';
import { useTasks } from '../useTasks';

export const LogTime: React.FC<{ task: ITaskOverview, dialogId: string }> = (props) => {
    const { updateTask, getTask } = useTasks();
    const { addAction } = useActions();
    const [time, setTime] = React.useState(0);

    const handleSave = async () => {
        dismissDialog(props.dialogId);
        loadingStart('default');
        await updateTask(props.task.Id, {
            EffectiveTime: props.task.EffectiveTime + time,
        });
        await addAction(props.task.Id, 'Time log', `${time} hour(s)`);
        taskUpdated(await getTask(props.task.Id));
        loadingStop('default');
    };

    return (
        <div
            style={{
                display: 'flex',
                flexFlow: 'column nowrap',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: '1em'
            }}
        >
            <div>
                <HoursInput
                    value={time}
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
            </div>
            <PrimaryButton onClick={handleSave}>Save</PrimaryButton>
        </div>
    );
};
