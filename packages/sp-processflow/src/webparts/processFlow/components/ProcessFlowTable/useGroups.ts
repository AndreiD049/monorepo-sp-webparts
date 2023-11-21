import { groupBy } from '@microsoft/sp-lodash-subset';
import * as React from 'react';
import { IProcessFlowRow } from '../../models/IProcessFlowRow';
import { ICustomerFlow } from '@service/process-flow';
import { IGroup } from 'office-ui-fabric-react';
import { headerProps, renderHeader } from './header';
import ProcessFlowWebPart from '../../ProcessFlowWebPart';

export interface IUseGroupProps {
    items: IProcessFlowRow[];
    groupSorting: { [key: string]: string[] };
    setGroupSorting: React.Dispatch<
        React.SetStateAction<{ [key: string]: string[] }>
    >;
    flow: ICustomerFlow;
}

function sortByOrder(a: IProcessFlowRow, b: IProcessFlowRow): number {
	if (a.process.OrderIndex === null) {
		return 1;
	}
	if (b.process.OrderIndex === null) {
		return -1;
	}
	return a.process.OrderIndex - b.process.OrderIndex;
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useGroups(props: IUseGroupProps) {
    const theme = ProcessFlowWebPart.currentTheme;
    const groupedItems = React.useMemo(
        () => groupBy(props.items, (i) => i.process.Category.trim()),
        [props.items]
    );

    const [groupState, setGroupState] = React.useState<{
        [key: string]: boolean;
    }>({});

    const sortedGroups = React.useMemo(() => {
        const currentSavedSorting: string[] = props.groupSorting[props.flow.Id] || [];
        const customSorting = currentSavedSorting.reduce<{
            [key: string]: number;
        }>((obj, g, idx) => {
            obj[g] = idx;
            return obj;
        }, {});
        return Object.keys(groupedItems).sort((a, b) => {
            if (customSorting[a] === undefined) return 1;
            if (customSorting[b] === undefined) return -1;
            if (
                customSorting[a] !== undefined &&
                customSorting[b] !== undefined
            ) {
                return customSorting[a] < customSorting[b] ? -1 : 1;
            }
            return a < b ? -1 : 1;
        });
    }, [groupedItems, props.groupSorting]);

    const sortedItems: IProcessFlowRow[] = React.useMemo(() => {
        return sortedGroups.reduce((acc, group) => {
            return [...acc, ...(groupedItems[group].sort(sortByOrder))];
        }, []);
    }, [sortedGroups, props.groupSorting]);

    const groups: IGroup[] = React.useMemo(() => {
        let startindex = 0;
        return sortedGroups.map((category) => {
            const idx = startindex;
            startindex += groupedItems[category].length;
            return {
                key: category,
                name: category,
                startIndex: idx,
                count: groupedItems[category].length,
                isCollapsed: Boolean(groupState[category]),
            };
        });
    }, [groupedItems, sortedGroups, groupState]);

    const groupProps = React.useMemo(
        () => ({
            onRenderHeader: renderHeader(
                props.setGroupSorting,
                (group) =>
                    setGroupState((prev) => ({
                        ...prev,
                        [group]: !Boolean(prev[group]),
                    })),
                props.flow.Id
            ),
            onToggleCollapseAll: (collapsed: boolean) => {
                setGroupState(
                    sortedGroups.reduce(
                        (o, g) => ({ ...o, [g]: collapsed }),
                        {}
                    )
                );
            },
            headerProps: headerProps(theme),
        }),
        [setGroupState, sortedGroups]
    );

    return {
        groups,
        sortedGroups,
        sortedItems,
        groupProps,
    };
}
