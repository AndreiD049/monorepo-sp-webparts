import { getTheme, IContextualMenuItem, Text } from 'office-ui-fabric-react';
import * as React from 'react';
import { FC } from 'react';
import IItem, { ItemStatus, ItemType } from '../../dal/IItem';
import ItemField from './ItemField';
import styles from './AppraisalItems.module.scss';
import { IUpdateItem, updateItem } from '../../dal/Items';
import IPeriod from '../../dal/IPeriod';
import {
    emptyItem,
    handleDelete,
    handleItemUpdate,
    setItemAction,
} from './utils';

export interface IItemContainerProps
    extends React.HtmlHTMLAttributes<HTMLElement> {
    minItems: number;
    items: IItem[];
    status: ItemStatus;
    itemType: ItemType;
    title?: string;
    period: IPeriod;
    userId: string;
    setItems: (f: (prev: IItem[]) => IItem[]) => void;
}

const theme = getTheme();

const ItemContainer: FC<IItemContainerProps> = (props) => {
    const emptySlots = React.useMemo(() => {
        return Math.max(props.minItems - props.items.length, 1);
    }, [props.items]);

    const emptyItems = React.useMemo(() => {
        const result: IItem[] = [];
        for (let i = 0; i < emptySlots; i++) {
            result.push(emptyItem(props.itemType));
        }
        return result;
    }, [props.items]);

    const setItemsHandler = (actionObject: setItemAction) => {
        switch (actionObject.action) {
            case 'create':
                props.setItems((old) => [...old, actionObject.item]);
                break;
            case 'update':
                props.setItems((prev) =>
                    prev.map((i) =>
                        i.Id === actionObject.id ? actionObject.item : i
                    )
                );
                break;
            case 'delete':
                props.setItems((prev) =>
                    prev.filter((item) => item.Id !== actionObject.id)
                );
                break;
            default:
                throw new Error(
                    'Unknown action received - ' + actionObject.action
                );
        }
    };

    const handleValueUpdate = (item: IItem) => async (value: string) => {
        handleItemUpdate(
            item,
            value,
            props.status,
            props.itemType,
            props.period.ID,
            props.userId,
            setItemsHandler
        );
    };

    const handleMove = React.useCallback(
        async (i: IItem) => {
            /* If there is no periodId, do nothing */
            if (!props.period.ID) return null;

            const update: IUpdateItem = {};
            if (props.status === 'Achieved') {
                update.AchievedInId = null;
                update.ItemStatus = 'Planned';
            } else {
                update.AchievedInId = props.period.ID;
                update.ItemStatus = 'Achieved';
            }
            const result = await updateItem(i.Id, update);
            props.setItems((prev) =>
                prev.map((itemOld) => (itemOld.Id === i.Id ? result : itemOld))
            );
        },
        [props.period.ID]
    );

    /* Actions that can be performed on items */
    const actions = React.useMemo(
        () => (item: IItem) => {
            const result: IContextualMenuItem[] = [
                {
                    key: 'delete',
                    iconProps: {
                        iconName: 'Delete',
                    },
                    text: 'Delete',
                    onClick: handleDelete.bind({}, item.Id, setItemsHandler),
                },
            ];
            if (props.status !== 'NA') {
                result.unshift({
                    key: 'move',
                    iconProps: {
                        iconName:
                            props.status === 'Achieved'
                                ? 'ChevronRight'
                                : 'ChevronLeft',
                    },
                    text: `Set ${
                        props.status === 'Achieved' ? 'Planned' : 'Achieved'
                    }`,
                    onClick: handleMove.bind({}, item),
                });
            }
            return result;
        },
        [props.status, props.period.ID]
    );

    return (
        <div
            className={props.className}
            style={{
                paddingTop: theme.spacing.s1,
                paddingBottom: theme.spacing.l1,
                paddingLeft: theme.spacing.s1,
                paddingRight: theme.spacing.s1,
            }}
        >
            <Text variant="mediumPlus" block className={styles.title}>
                {props.title ?? props.status}
            </Text>
            {props.items.map((item) => (
                <ItemField
                    key={item.Id}
                    item={item}
                    disabled={props.period.Status === 'Finished'}
                    handleBlur={handleValueUpdate(item)}
                    actions={actions(item)}
                />
            ))}
            {emptyItems.map((item, idx) => (
                <ItemField
                    key={`empty--${props.items.length + idx}`}
                    item={item}
                    disabled={props.period.Status === 'Finished'}
                    handleBlur={handleValueUpdate(item)}
                    actions={actions(item).map((a) => ({
                        ...a,
                        disabled: true,
                    }))}
                />
            ))}
        </div>
    );
};

export default ItemContainer;
