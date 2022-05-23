import {
    Icon,
    Link,
    Pivot,
    PivotItem,
    Separator,
    Stack,
    StackItem,
    Text,
    TextField,
} from 'office-ui-fabric-react';
import * as React from 'react';
import { Attachments } from '../../attachments/Attachments';
import { IAttachment } from '../../attachments/IAttachment';
import { useAttachments } from '../../attachments/useAttachments';
import { Comments } from '../../comments/Comments';
import { useComments } from '../../comments/useComments';
import { FileInput } from '../../components/Utils/FileInput';
import { GlobalContext } from '../../utils/GlobalContext';
import { TaskNode } from '../graph/TaskNode';
import { useTasks } from '../useTasks';
import styles from './Panels.module.scss';

export interface ITaskDetailsProps {
    node: TaskNode;
}

const TaskGeneralDetails = (props: { node: TaskNode }) => {
    const { theme, properties } = React.useContext(GlobalContext);
    const task = React.useMemo(() => props.node.getTask(), [props.node]);
    const [description, setDescription] = React.useState(task.Description);
    const { updateTask, getTask } = useTasks();

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
                    <Text block variant="large">
                        Comments
                    </Text>
                    <Separator />
                    <Comments task={task} />
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
