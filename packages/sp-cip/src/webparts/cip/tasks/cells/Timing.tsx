import {
    ActionButton,
    Stack,
    StackItem,
    Text,
} from '@fluentui/react';
import * as React from 'react';
import {
    loadingStart,
    loadingStop,
} from '../../components/utils/LoadingAnimation';
import { calloutVisibility, taskUpdated } from '../../utils/dom-events';
import { TaskNode } from '../graph/TaskNode';
import { TaskNodeContext } from '../TaskNodeContext';
import styles from './Cells.module.scss';
import MainService from '../../services/main-service';
import { formatHours } from '../../utils/hours-duration';
import { HoursInput } from '../../components/HoursInput';
import { GlobalContext } from '../../utils/GlobalContext';

const TimingCallout: React.FC<ITimingProps> = (props) => {
    const { currentUser } = React.useContext(GlobalContext);
    const task = props.node.getTask();
    const taskService = MainService.getTaskService();
    const actionService = MainService.getActionService();
    const [value, setValue] = React.useState(task.EstimatedTime);

    const handleSave = React.useCallback(async () => {
        loadingStart();
        calloutVisibility({ visible: false });
        await taskService.updateTask(task.Id, {
            EstimatedTime: value,
        });
        const newTask = await taskService.getTask(task.Id);
        await actionService.addAction(
            task.Id,
            'Estimated time',
            `${task.EstimatedTime}|${newTask.EstimatedTime}`,
            currentUser.Id,
            new Date().toISOString()
        );
        taskUpdated(newTask);
        loadingStop();
    }, [props.node, value]);

    return (
        <Stack className={styles.callout} horizontalAlign="center">
            <StackItem
                align="stretch"
                styles={{ root: { marginBottom: '.5em' } }}
            >
                <Text variant="medium" block>
                    Update estimated hours:
                </Text>
            </StackItem>
            <HoursInput
                value={value}
                onChange={(val) => setValue(val)}
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
            <ActionButton iconProps={{ iconName: 'Save' }} onClick={handleSave}>
                Save
            </ActionButton>
        </Stack>
    );
};

export interface ITimingProps {
    node: TaskNode;
}

const Timing: React.FC<ITimingProps> = (props) => {
    const { isTaskFinished } = React.useContext(TaskNodeContext);
	const { timingInfo } = React.useContext(GlobalContext);
    const task = props.node.getTask();
    const elemRef = React.useRef(null);
	
	// Get the timing info of subtasks
	const additionalTimingEst = timingInfo[task.Id]?.EstimatedTime || 0;
	const additionalTimingEff = timingInfo[task.Id]?.EffectiveTime || 0;

    const handleClick = React.useCallback(
        () => {
            calloutVisibility({
                target: elemRef,
                visible: true,
                RenderComponent: TimingCallout,
                componentProps: props,
            });
        },
        [props.node, elemRef]
    );

    return (
        <button
            className={styles.button}
            disabled={isTaskFinished}
            ref={elemRef}
            onClick={handleClick}
        >
            <div>Estimated: {formatHours(task.EstimatedTime + additionalTimingEst)} hour(s)</div>
            <div style={{ fontWeight: 'bold' }}>
                Effective: {formatHours(task.EffectiveTime + additionalTimingEff)} hour(s)
            </div>
        </button>
    );
};

export default Timing;
