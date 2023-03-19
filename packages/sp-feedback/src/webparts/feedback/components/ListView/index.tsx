import { Icon } from 'office-ui-fabric-react';
import * as React from 'react';
import { getGroupedItems, getGroupKeys } from '../../../../features/grouped-items';
import { Item } from '../../item';
import { Collapsible } from '../Collapsible';
import { NColumnLayout } from '../NColumnLayout';
import styles from './ListView.module.scss';

export interface IListViewProps {
    items: Item[];
    groupField: string | undefined;
    columns: number;
}

const GroupHeader: React.FC<{ group: string; itemsCount: number, collapsed?: boolean }> = (
    props
) => {
    return (
        <div className={styles.groupHeader}>
            <Icon iconName={props.collapsed ? 'ChevronRight' : 'ChevronDown'} /> {props.group} ({props.itemsCount})
        </div>
    );
};

export const ListView: React.FC<IListViewProps> = (props) => {
    const groupedItems = React.useMemo(() => getGroupedItems(props.items, props.groupField), [props.items, props.groupField]);

    const body = React.useMemo(() => {
        if (!groupedItems) {
            return (
                <NColumnLayout
                    items={props.items}
                    cols={props.columns}
                    key={`cols-${props.columns}`}
                />
            );
        }
        const groupKeys = getGroupKeys(groupedItems).sort();
        return (
            <>
                {groupKeys.map((k) => (
                    <div key={k}>
                        <Collapsible
                            header={(collapsed) => (
                                <GroupHeader
                                    group={k}
                                    itemsCount={groupedItems[k].length}
                                    collapsed={collapsed}
                                />
                            )}
                        >
                            <div className={styles.groupBody}>
                                <NColumnLayout
                                    items={groupedItems[k]}
                                    cols={props.columns}
                                    key={`${k}-${props.columns}`}
                                />
                            </div>
                        </Collapsible>
                    </div>
                ))}
            </>
        );
    }, [props.items, groupedItems]);

    return <div className={styles.container}>{body}</div>;
};
