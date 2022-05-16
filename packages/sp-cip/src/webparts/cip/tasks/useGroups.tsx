import {
    CollapseAllVisibility,
    IDetailsGroupRenderProps,
    IGroup,
} from 'office-ui-fabric-react';
import * as React from 'react';
import { useState } from 'react';
import useWebStorage from 'use-web-storage-api';
import { GROUP_LABELS_KEY } from '../utils/constants';
import { TaskNode } from './graph/TaskNode';

export const useGroups = (tasks?: { key: number; data: TaskNode }[]) => {
    const [allCollapsed, setAllCollapsed] = useState(false);
    const [groupStatus, setGroupStatus] = useState({});
    const [groupLabels, setGroupLabels] = useWebStorage([], {
        key: GROUP_LABELS_KEY,
    });

    const groups: IGroup[] = React.useMemo(() => {
        if (!tasks) return;
        const groups = {};
        tasks.forEach((node, idx) => {
            const category = node.data.Category || 'Other';
            if (category in groups) {
                groups[category].count += 1;
            } else {
                groups[category] = {
                    key: category,
                    name: category,
                    count: 1,
                    startIndex: idx,
                    isCollapsed: groupStatus[category] || false,
                };
            }
        });
        setGroupLabels(Object.keys(groups));
        return Object.values(groups);
    }, [tasks, groupStatus]);

    const groupProps: IDetailsGroupRenderProps = React.useMemo(() => {
        if (!tasks) return;
        return {
            isAllGroupsCollapsed: allCollapsed,
            onToggleCollapseAll: () => {
                setGroupStatus((prev) => {
                    const copy = {...prev};
                    groupLabels.forEach((key) => {
                        copy[key] = !allCollapsed;
                    });
                    return copy;
                });
                setAllCollapsed(prev => !prev);
            },
            headerProps: {
                onToggleCollapse: (group) =>
                    setGroupStatus((prev) => ({
                        ...prev,
                        [group.key]: !group.isCollapsed,
                    })),
            },
        };
    }, [allCollapsed, groupLabels]);

    return { groups, groupProps, groupLabels, setGroupLabels };
};
