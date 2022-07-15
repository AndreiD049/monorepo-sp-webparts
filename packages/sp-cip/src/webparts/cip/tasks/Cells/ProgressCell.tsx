import { ActionButton, Slider, StackItem, Text } from 'office-ui-fabric-react';
import * as React from 'react';
import { useActions } from '../../comments/useActions';
import { loadingStart, loadingStop } from '../../components/Utils/LoadingAnimation';
import { calloutVisibility, taskUpdated } from '../../utils/dom-events';
import { TaskNode } from '../graph/TaskNode';
import { TaskNodeContext } from '../TaskNodeContext';
import { useTasks } from '../useTasks';
import styles from './Cells.module.scss';

export interface IProgressCellProps {
    node: TaskNode;
}

const ProgressCellCallout: React.FC<IProgressCellProps> = (props) => {
    const { getTask, updateTask } = useTasks();
    const { addAction } = useActions();
    const [value, setValue] = React.useState(props.node.getTask().Progress);

    const handleClick = React.useCallback(async () => {
        calloutVisibility({
            visible: false,
        });
        loadingStart();
        await updateTask(props.node.Id, {
            Progress: value,
        });
        await addAction(props.node.Id, 'Progress', `${Math.round(value * 100)}%`)
        taskUpdated(await getTask(props.node.Id));
        loadingStop();
    }, [props.node, value]);

    return (
        <div className={`${styles.callout} ${styles['callout-progress']}`}>
            <Text style={{ marginBottom: '.5em' }} variant="medium">
                Update progress:
            </Text>
            <Slider
                min={0}
                max={100}
                step={5}
                onChange={(val) => {
                    setValue(val / 100);
                }}
                value={Math.round(value * 100)}
                valueFormat={(num) => `${num}%`}
            />
            <StackItem align="center">
                <ActionButton
                    iconProps={{ iconName: 'Save' }}
                    onClick={handleClick}
                >
                    Save
                </ActionButton>
            </StackItem>
        </div>
    );
};

export const ProgressCell: React.FC<IProgressCellProps> = (props) => {
    const { isTaskFinished } = React.useContext(TaskNodeContext);
    const progressRef = React.useRef();
    const handleClick = React.useCallback(() => {
        calloutVisibility({
            target: progressRef,
            visible: true,
            RenderComponent: ProgressCellCallout,
            componentProps: props,
        });
    }, [props.node, progressRef]);
    const isDisabled = React.useMemo(() => {
        return props.node.Display === 'disabled' || isTaskFinished;
    }, [props.node, isTaskFinished]);

    return (
        <button
            ref={progressRef}
            className={`${styles.progress} ${styles.button}`}
            onClick={handleClick}
            disabled={isDisabled}
        >
            <Text
                variant="medium"
                className={styles['progress-value']}
            >{`${Math.round(props.node.getTask()?.Progress * 100)}%`}</Text>
            <div
                className={`${styles['progress-bar']} ${
                    isDisabled ? styles.disabled : ''
                }`}
                style={{ width: `${props.node.getTask().Progress * 100}%` }}
            />
        </button>
    );
};
