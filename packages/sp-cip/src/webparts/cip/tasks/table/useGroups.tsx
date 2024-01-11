import { IDetailsGroupRenderProps, IGroup } from '@fluentui/react';
import * as React from 'react';
import { useState } from 'react';
import useWebStorage from 'use-web-storage-api';
import { GROUP_LABELS_KEY } from '../../utils/constants';
import { TaskNode } from '../graph/TaskNode';

export const useGroups = (
    tasks?: { key: number; data: TaskNode }[],
    showCategories: boolean = true
): {
    groups: IGroup[];
    groupProps: IDetailsGroupRenderProps;
    groupLabels: string[];
    setGroupLabels: React.Dispatch<React.SetStateAction<string[]>>;
} => {
    const [allCollapsed, setAllCollapsed] = useState(false);
    const [groupStatus, setGroupStatus] = useState<{ [key: string]: boolean }>(
        {}
    );
    const [groupLabels, setGroupLabels] = useWebStorage([], {
        key: GROUP_LABELS_KEY,
    });

    const groups: IGroup[] = React.useMemo(() => {
        if (!tasks) return null;
        if (!showCategories) return null;
        const groups: {
            [key: string]: {
                count: number;
                key: string;
                name: string;
                startIndex: number;
                isCollapsed: boolean;
            };
        } = {};
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
    }, [tasks, groupStatus, showCategories]);

    const groupProps: IDetailsGroupRenderProps = React.useMemo(() => {
        if (!tasks) return null;
        if (!showCategories) return null;
        return {
            isAllGroupsCollapsed: allCollapsed,
            onToggleCollapseAll: () => {
                setGroupStatus((prev) => {
                    const copy = { ...prev };
                    groupLabels.forEach((key) => {
                        copy[key] = !allCollapsed;
                    });
                    return copy;
                });
                setAllCollapsed((prev) => !prev);
            },
            headerProps: {
                onToggleCollapse: (group) =>
                    setGroupStatus((prev) => ({
                        ...prev,
                        [group.key]: !group.isCollapsed,
                    })),
            },
        };
    }, [allCollapsed, groupLabels, showCategories]);

    return { groups, groupProps, groupLabels, setGroupLabels };
};
