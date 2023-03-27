import { ActionButton, Slider, StackItem, Text } from 'office-ui-fabric-react';
import * as React from 'react';
import {
    loadingStart,
    loadingStop,
} from '../../components/utils/LoadingAnimation';
import { calloutVisibility, taskUpdated } from '../../utils/dom-events';
import { GlobalContext } from '../../utils/GlobalContext';
import { TaskNode } from '../graph/TaskNode';
import { TaskNodeContext } from '../TaskNodeContext';
import { finishTask } from '../../utils/task';
import styles from './Cells.module.scss';
import MainService from '../../services/main-service';

export interface IProgressCellProps {
    node: TaskNode;
}

export function formatProgress(value: number): string {
    return `${Math.round(value * 100)}%`;
}

const ProgressCellCallout: React.FC<IProgressCellProps> = (props) => {
    const { currentUser } = React.useContext(GlobalContext);
    const taskService = MainService.getTaskService();
    const actionService = MainService.getActionService();
    const [value, setValue] = React.useState(props.node.getTask().Progress);

    const handleClick = React.useCallback(async () => {
        try {
            calloutVisibility({
                visible: false,
            });
            loadingStart();
            if (value === 1) {
                const newItem = await finishTask(
                    props.node.getTask(),
                    currentUser.Id
                );
                taskUpdated(newItem);
                if (newItem.ParentId) {
                    taskUpdated(await taskService.getTask(newItem.ParentId));
                }
            } else {
                await taskService.updateTask(props.node.Id, {
                    Progress: value,
                });
                await actionService.addAction(
                    props.node.Id,
                    'Progress',
                    formatProgress(value),
                    currentUser.Id,
                    new Date().toISOString()
                );
                taskUpdated(await taskService.getTask(props.node.Id));
            }
        } finally {
            loadingStop();
        }
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
            <Text variant="medium" className={styles['progress-value']}>
                {formatProgress(props.node.getTask()?.Progress)}
            </Text>
            <div
                className={`${styles['progress-bar']} ${
                    isDisabled ? styles.disabled : ''
                }`}
                style={{ width: `${props.node.getTask().Progress * 100}%` }}
            />
        </button>
    );
};
