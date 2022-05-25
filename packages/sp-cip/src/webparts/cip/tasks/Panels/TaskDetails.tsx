import {
    Pivot,
    PivotItem,
    Stack,
    StackItem,
    TextField,
} from 'office-ui-fabric-react';
import * as React from 'react';
import { Attachments } from '../../attachments/Attachments';
import { Comments } from '../../comments/Comments';
import { TaskNode } from '../graph/TaskNode';
import styles from './Panels.module.scss';

export interface ITaskDetailsProps {
    node: TaskNode;
}

export const TaskDetails: React.FC<ITaskDetailsProps> = (props) => {
    const task = React.useMemo(() => props.node.getTask(), [props.node]);
    const [description, setDescription] = React.useState(task.Description);

    return (
        <div className={styles['details-panel']}>
            <Stack>
                <StackItem>
                    <TextField
                        label="Title"
                        value={task.Title}
                        readOnly
                        borderless
                    />
                    <TextField
                        label="Description"
                        value={task.Description}
                        readOnly
                        borderless
                        multiline
                        resizable={false}
                        autoAdjustHeight
                    />
                    <Attachments task={task} />
                </StackItem>
                <StackItem style={{ marginTop: '1em' }}>
                    <Pivot>
                        <PivotItem headerText="General">
                            <Comments task={task} />
                        </PivotItem>
                        <PivotItem headerText="Action log">Actions</PivotItem>
                    </Pivot>
                </StackItem>
            </Stack>
        </div>
    );
};
