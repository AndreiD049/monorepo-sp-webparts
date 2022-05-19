import {
    Pivot,
    PivotItem,
    Stack,
    StackItem,
    Text,
} from 'office-ui-fabric-react';
import * as React from 'react';
import { nodeToggleOpen } from '../../utils/dom-events';
import { TaskNode } from '../graph/TaskNode';
import styles from './Panels.module.scss';

export interface ITaskDetailsProps {
    node: TaskNode;
}

const TaskGeneralDetails = (props: { node: TaskNode }) => {
    const task = React.useMemo(() => props.node.getTask(), [props.node]);
    return (
        <div className={styles['details-panel']}>
            <Stack>
                <StackItem>
                    <Text style={{ whiteSpace: 'pre' }} variant="mediumPlus">
                        {task.Description}
                    </Text>
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
                <PivotItem headerText="Comments">Comments</PivotItem>
                <PivotItem headerText="Action log">Actions</PivotItem>
            </Pivot>
        </div>
    );
};
