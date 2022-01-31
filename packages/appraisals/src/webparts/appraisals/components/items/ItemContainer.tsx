import { getTheme, IContextualMenuItem, Text } from 'office-ui-fabric-react';
import * as React from 'react';
import { FC } from 'react';
import IItem, { ItemStatus, ItemType } from '../../dal/IItem';
import ItemField from './ItemField';
import styles from './ItemContainer.module.scss';
import {
    createItem,
    deleteItem,
    IUpdateItem,
    updateItem,
} from '../../dal/Items';

export interface IItemContainerProps extends React.HtmlHTMLAttributes<HTMLElement> {
    minItems: number;
    items: IItem[];
    status: ItemStatus;
    itemType: ItemType;
    title?: string;
    periodId: string;
    userId: string;
    setItems: (f: (prev: IItem[]) => IItem[]) => void;
}

const emptyItem = (itype: ItemType): IItem => ({
    AchievedIn: null,
    Id: '',
    ItemStatus: 'NA',
    Content: '',
    ItemType: itype,
    PlannedIn: null,
    User: null,
});

const isEmpty = (item: IItem) => item.Id === '';

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

    const handleCreate = async (item: Partial<IItem>) => {
        const result = await createItem({
            Content: item.Content,
            ItemStatus: props.status,
            ItemType: props.itemType,
            PlannedInId: props.periodId,
            AchievedInId: props.status === 'Achieved' ? props.periodId : null,
            UserId: props.userId,
        });
        props.setItems((old) => [...old, result]);
    };

    const handleUpdate = async (id: string, item: Partial<IItem>) => {
        const result = await updateItem(id, item);
        props.setItems((prev) => prev.map((i) => (i.Id === id ? result : i)));
    };

    const handleDelete = async (id: string) => {
        await deleteItem(id);
        props.setItems((prev) => prev.filter((item) => item.Id !== id));
    };

    const handleValueUpdate = (item: IItem) => async (value: string) => {
        /* Handle creation of new items */
        if (isEmpty(item) && value !== '') {
            handleCreate({
                ...item,
                Content: value,
            });
        } else if (!isEmpty(item) && value !== '' && item.Content !== value) {
            handleUpdate(item.Id, {
                Content: value,
            });
        } else if (!isEmpty(item) && value === '') {
            handleDelete(item.Id);
        }
    };

    const handleMove = React.useCallback(
        async (i: IItem) => {
            /* If there is no periodId, do nothing */
            if (!props.periodId) return null;

            const update: IUpdateItem = {};
            if (props.status === 'Achieved') {
                update.AchievedInId = null;
                update.ItemStatus = 'Planned';
            } else {
                update.AchievedInId = props.periodId;
                update.ItemStatus = 'Achieved';
            }
            const result = await updateItem(i.Id, update);
            props.setItems((prev) =>
                prev.map((itemOld) => (itemOld.Id === i.Id ? result : itemOld))
            );
        },
        [props.periodId]
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
                    onClick: handleDelete.bind({}, item.Id),
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
        [props.status, props.periodId]
    );

    return (
        <div
            className={`${styles.container} ${props.className}`}
            style={{
                paddingTop: theme.spacing.s1,
                paddingBottom: theme.spacing.l1,
                paddingLeft: theme.spacing.s1,
                paddingRight: theme.spacing.s1,
                boxShadow: theme.effects.elevation4,
            }}
        >
            <Text
                variant='mediumPlus'
                block
                styles={{
                    root: {
                        textAlign: 'center',
                    },
                }}
            >
                {props.title ?? props.status}
            </Text>
            {props.items.map((item) => (
                <ItemField
                    key={item.Id}
                    item={item}
                    handleBlur={handleValueUpdate(item)}
                    actions={actions(item)}
                />
            ))}
            {emptyItems.map((item, idx) => (
                <ItemField
                    key={`empty--${props.items.length + idx}`}
                    item={item}
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
