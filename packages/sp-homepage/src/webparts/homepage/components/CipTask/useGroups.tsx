import { groupBy } from '@microsoft/sp-lodash-subset';
import { IGroup } from '@fluentui/react';
import * as React from 'react';

export interface IGroupInfo {
    groups: IGroup[];
}

export function useGroups<T>(items: T[], getGroupLabel: (item: T) => string): IGroupInfo {

    const groups = React.useMemo(() => {
        const result: IGroup[] = [];
        const groupedTasks = groupBy(items, (item) => getGroupLabel(item));
        let idx = 0;
        for (const key in groupedTasks) {
            if (Object.prototype.hasOwnProperty.call(groupedTasks, key)) {
                const element = groupedTasks[key];
                result.push({
                    key,
                    name: key,
                    count: element.length,
                    startIndex: idx,
                });
                idx += element.length;
            }
        }
        return result;
    }, [items]);

    return {
        groups,
    };
}
