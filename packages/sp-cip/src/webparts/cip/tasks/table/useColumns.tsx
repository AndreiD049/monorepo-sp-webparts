import { ColumnActionsMode, IColumn } from 'office-ui-fabric-react';
import * as React from 'react';
import { calloutVisibility } from '../../utils/dom-events';
import { TaskNode } from '../graph/TaskNode';
import { ChoiceFacet, IChoiceFacetProps } from './ChoiceFacet';

export const useColumns = (tree: TaskNode) => {
    const nodes = React.useMemo(() => tree.getAllDescendants(), [tree])

    const columns: IColumn[] = [
        {
            key: 'Title',
            name: 'Title',
            fieldName: 'Title',
            minWidth: 500,
            isResizable: true,
            columnActionsMode: ColumnActionsMode.hasDropdown,
            onColumnContextMenu: (col, ev) => {
                calloutVisibility<IChoiceFacetProps>({
                    visible: true,
                    isBeakVisible: false,
                    target: ev.currentTarget as any,
                    gapSpace: 3,
                    RenderComponent: ChoiceFacet,
                    componentProps: {
                        options: nodes,
                        getValue: (t) => t.getTask().Title,
                        onChange: (options) => console.log(options),
                        column: col,
                    }
                });
            },
        },
        {
            key: 'Actions',
            name: 'Actions',
            fieldName: 'Actions',
            minWidth: 150,
        },
        {
            key: 'Priority',
            name: 'Priority',
            fieldName: 'Priority',
            minWidth: 100,
        },
        {
            key: 'Responsible',
            name: 'Responsible',
            fieldName: 'Responsible',
            minWidth: 150,
        },
        {
            key: 'Status',
            name: 'Status',
            fieldName: 'Status',
            minWidth: 100,
        },
        {
            key: 'Progress',
            name: 'Progress',
            fieldName: 'Progress',
            minWidth: 100,
        },
        {
            key: 'DueDate',
            name: 'Due Date',
            fieldName: 'DueDate',
            minWidth: 100,
        },
        {
            key: 'Team',
            name: 'Team',
            fieldName: 'Team',
            minWidth: 100,
        },
        {
            key: 'Timing',
            name: 'Timing',
            fieldName: 'Timing',
            minWidth: 200,
        },
    ];

    return { columns };
};
