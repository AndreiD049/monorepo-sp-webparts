import { PrimaryButton, Slider, Text } from 'office-ui-fabric-react';
import * as React from 'react';
import { calloutVisibility, taskUpdated } from '../../utils/dom-events';
import { TaskNode } from '../graph/TaskNode';
import { useTasks } from '../useTasks';
import styles from './Cells.module.scss';

export interface IProgressCellProps {
    node: TaskNode;
}

const ProgressCellCallout: React.FC<IProgressCellProps> = (props) => {
    const { getTask, updateTask } = useTasks();
    const [value, setValue] = React.useState(props.node.getTask().Progress);

    const handleClick = React.useCallback(async () => {
        await updateTask(props.node.Id, {
            Progress: value,
        });
        taskUpdated(await getTask(props.node.Id));
        calloutVisibility({
            visible: false,
        });
    }, [props.node, value]);

    return (
        <div className={`${styles.callout} ${styles['callout-progress']}`}>
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
            <PrimaryButton
                style={{
                    marginTop: '.5em',
                }}
                onClick={handleClick}
            >
                Save
            </PrimaryButton>
        </div>
    );
};

export const ProgressCell: React.FC<IProgressCellProps> = (props) => {
    const progressRef = React.useRef();
    const handleClick = React.useCallback(() => {
        calloutVisibility({
            target: progressRef,
            visible: true,
            RenderComponent: ProgressCellCallout,
            componentProps: props,
        });
    }, [props.node, progressRef]);

    return (
        <div
            ref={progressRef}
            className={styles.progress}
            onClick={handleClick}
        >
            <Text
                variant="medium"
                className={styles['progress-value']}
            >{`${Math.round(props.node.getTask()?.Progress * 100)}%`}</Text>
            <div
                className={styles['progress-bar']}
                style={{ width: `${props.node.getTask().Progress * 100}%` }}
            />
        </div>
    );
};
