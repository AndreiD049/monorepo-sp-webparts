import { Text } from 'office-ui-fabric-react';
import * as React from 'react';
import Timing from './Timing';
import { TaskNode } from '../graph/TaskNode';
import ActionsCell from './ActionsCell';
import { DueDateCell } from './DueDateCell';
import { ProgressCell } from './ProgressCell';
import { StatusCell } from './StatusCell';
import { TeamCell } from './TeamCell';
import { TitleCell } from './TitleCell';
import PriorityCell from './PriorityCell';
import ResponsibleCell from './ResponsibleCell';
import { ITaskOverview } from '@service/sp-cip/dist/models/ITaskOverview';

interface IRenderCellProps {
    fieldName: string;
    node: TaskNode;
}

export const RenderCell: React.FC<IRenderCellProps> = (props) => {
    const nestLevel = props.node.level || 0;

    switch (props.fieldName.toLowerCase()) {
        case 'title':
            return <TitleCell node={props.node} nestLevel={nestLevel} />;
        case 'responsible':
            return (
                <ResponsibleCell
                    task={props.node.getTask()}
                />
            );
        case 'status':
            return <StatusCell node={props.node} />;
        case 'priority':
            return <PriorityCell node={props.node} />;
        case 'actions':
            return <ActionsCell node={props.node} />;
        case 'progress':
            return <ProgressCell node={props.node} />;
        case 'duedate':
            return <DueDateCell node={props.node} />;
        case 'team':
            return <TeamCell node={props.node} />;
        case 'timing':
            return <Timing node={props.node} />;
        default:
            return (
                <Text variant="medium" block>
                    {props.node.getTask()[
                        props.fieldName as keyof ITaskOverview
                    ] + ''}
                </Text>
            );
    }
};
