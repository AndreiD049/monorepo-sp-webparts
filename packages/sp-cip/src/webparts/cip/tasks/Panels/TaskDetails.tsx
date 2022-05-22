import {
    getRTLSafeKeyCode,
    Pivot,
    PivotItem,
    Stack,
    StackItem,
    Text,
} from 'office-ui-fabric-react';
import * as React from 'react';
import { useAttachments } from '../../attachments/useAttachments';
import { DescriptionEditor } from '../../components/DescriptionEditor';
import { nodeToggleOpen, taskUpdated, taskUpdatedHandler } from '../../utils/dom-events';
import { TaskNode } from '../graph/TaskNode';
import { useTasks } from '../useTasks';
import styles from './Panels.module.scss';

export interface ITaskDetailsProps {
    node: TaskNode;
}

const TaskGeneralDetails = (props: { node: TaskNode }) => {
    const task = React.useMemo(() => props.node.getTask(), [props.node]);
    const [description, setDescription] = React.useState(task.Description);
    const {updateTask, getTask} = useTasks();
    const attachments = useAttachments();

    return (
        <div className={styles['details-panel']}>
            <Stack>
                <StackItem>
                    <Text variant="medium">{task.Title}</Text>
                    <DescriptionEditor
                        value={description}
                        onChange={(val) => setDescription(val)}
                        onSave={async () => {
                            if (task.Description !== description) {
                                await updateTask(task.Id, {
                                    Description: description
                                });
                                const newTask = await getTask(task.Id);
                                taskUpdated(newTask);
                            }
                        }}
                        style={{ marginTop: '2em' }}
                    />
                </StackItem>
            </Stack>
        </div>
    );
};

export const TaskDetails: React.FC<ITaskDetailsProps> = (props) => {
    return (
        <div>
            <Pivot>
                <PivotItem headerText="General">
                    <TaskGeneralDetails node={props.node} />
                </PivotItem>
                <PivotItem headerText="Action log">Actions</PivotItem>
            </Pivot>
        </div>
    );
};
