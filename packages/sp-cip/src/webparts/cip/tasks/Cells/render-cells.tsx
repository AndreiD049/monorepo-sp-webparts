import { Persona, PersonaSize, Text } from 'office-ui-fabric-react';
import * as React from 'react';
import Pill from '../../components/Pill/Pill';
import Timing from '../../components/Timing';
import { TaskNode } from '../graph/TaskNode';
import ActionsCell from './ActionsCell';
import { ProgressCell } from './ProgressCell';
import { StatusCell } from './StatusCell';
import { TitleCell } from './TitleCell';

export const renderCell = (
    fieldName: string,
    node: TaskNode,
) => {
    const nestLevel = node.level || 0;
    const task = node.getTask();
    switch (fieldName.toLowerCase()) {
        case 'title':
            return TitleCell(node, nestLevel);
        case 'responsible':
            return (
                <Persona
                    text={task.Responsible.Title}
                    size={PersonaSize.size24}
                    imageUrl={`/_layouts/15/userphoto.aspx?AccountName=${task.Responsible.EMail}&Size=M`}
                    title={task.Responsible.Title}
                />
            );
        case 'status':
            return <StatusCell node={node} />;
        case 'priority':
            return (
                <Pill
                    style={{
                        height: '100%',
                        width: '100%',
                        borderRadius: '5px',
                    }}
                    value={task.Priority}
                />
            )
        case 'actions':
            return ActionsCell(node, nestLevel);
        case 'progress':
            return <ProgressCell node={node} />;
        case 'duedate':
            return (
                <Text variant="medium">
                    {new Date(task.DueDate).toLocaleDateString()}
                </Text>
            );
        case 'timing':
            return (
                <Timing
                    estimatedTime={task.EstimatedTime}
                    effectiveTime={task.EffectiveTime}
                />
            );
        default:
            return (
                <Text variant="medium" block>
                    {node.getTask()[fieldName]}
                </Text>
            );
    }
};
