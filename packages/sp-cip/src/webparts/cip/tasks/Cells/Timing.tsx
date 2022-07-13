import {
    ActionButton,
    SpinButton,
    Stack,
    StackItem,
    Text,
} from 'office-ui-fabric-react';
import * as React from 'react';
import { calloutVisibility, taskUpdated } from '../../utils/dom-events';
import { TaskNode } from '../graph/TaskNode';
import { TaskNodeContext } from '../TaskNodeContext';
import { useTasks } from '../useTasks';
import styles from './Cells.module.scss';

const TimingCallout: React.FC<ITimingProps> = (props) => {
    const task = props.node.getTask();
    const { updateTask, getTask } = useTasks();
    const [value, setValue] = React.useState(task.EstimatedTime);

    const handleSave = React.useCallback(async () => {
        await updateTask(task.Id, {
            EstimatedTime: value,
        });
        taskUpdated(await getTask(task.Id));
        calloutVisibility({ visible: false });
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
            <SpinButton
                inputProps={{
                    autoFocus: true,
                }}
                tabIndex={1}
                value={value.toString()}
                min={0}
                onValidate={(val) => !Number.isNaN(+val) ? val : null}
                onChange={(ev: any) => {
                    const val = ev.target.value;
                    if (!Number.isNaN(+val)) {
                        setValue(+val);
                    }
                }}
                onIncrement={(val) => {
                    if (!Number.isNaN(+val)) {
                        setValue(+val + 1);
                    }
                }}
                onDecrement={(val) => {
                    if (!Number.isNaN(+val) && +val > 0) {
                        setValue(+val - 1);
                    }
                }}
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
    const task = props.node.getTask();
    const elemRef = React.useRef(null);

    const handleClick = React.useCallback(
        (evt) => {
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
            disabled={props.node.Display === 'disabled' || isTaskFinished}
            ref={elemRef}
            onClick={handleClick}
        >
            <div>Estimated: {task.EstimatedTime} hour(s)</div>
            <div>Effective: {task.EffectiveTime} hour(s)</div>
        </button>
    );
};

export default Timing;
