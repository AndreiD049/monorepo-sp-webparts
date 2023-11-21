/* eslint-disable @typescript-eslint/no-explicit-any */
import { MessageBarType } from '@fluentui/react';
import { SPnotify } from 'sp-react-notifications';
import IItem, { ItemStatus, ItemType } from '../../dal/IItem';
import IPeriod from '../../dal/IPeriod';
import ItemService from '../../dal/Items';
const isEmpty = (item: IItem) => item.Id === '';

export type setItemAction = {
    action: 'create' | 'update' | 'delete';
    item?: IItem;
    id: string;
};

const handleCreate = async (
    item: Partial<IItem>,
    status: ItemStatus,
    itemType: ItemType,
    periodId: string,
    userId: string,
    setItems: (action: setItemAction) => any
) => {
    const itemService = new ItemService();
    try {
        const result = await itemService.createItem({
            Content: item.Content,
            ItemStatus: status,
            ItemType: itemType,
            PlannedIn: periodId,
            AchievedIn:
                status === 'Achieved' || status === 'NA' ? periodId : null,
            User: userId,
        });
        setItems({
            action: 'create',
            item: result,
            id: result.Id,
        });
    } catch (err) {
        SPnotify({
            message: err.message,
            messageType: MessageBarType.error,
            timeout: 5000,
        });
    }
};

const handleUpdate = async (
    id: string,
    item: Partial<IItem>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setItems: (old: any) => any
) => {
    try {
        const itemService = new ItemService();
        const result = await itemService.updateItem(id, item);
        setItems({
            action: 'update',
            item: result,
            id: result.Id,
        });
    } catch (err) {
        SPnotify({
            message: err.message,
            messageType: MessageBarType.error,
            timeout: 5000,
        });
    }
};

const handleDelete = async (id: string, setItems: (old: any) => any) => {
    try {
        const itemService = new ItemService();
        await itemService.deleteItem(id);
        setItems({
            action: 'delete',
            id: id,
        });
    } catch (err) {
        SPnotify({
            message: err.message,
            messageType: MessageBarType.error,
            timeout: 5000,
        });
    }
};

const handleItemUpdate = async (
    item: IItem,
    newValue: string,
    status: ItemStatus,
    itemType: ItemType,
    periodId: string,
    userId: string,
    setItems: (action: setItemAction) => any
) => {
    /* Handle creation of new items */
    if (isEmpty(item) && newValue.trim() !== '') {
        handleCreate(
            {
                ...item,
                Content: newValue,
            },
            status,
            itemType,
            periodId,
            userId,
            setItems
        );
    } else if (!isEmpty(item) && newValue !== '' && item.Content !== newValue) {
        handleUpdate(
            item.Id,
            {
                Content: newValue,
            },
            setItems
        );
    } else if (!isEmpty(item) && newValue === '') {
        handleDelete(item.Id, setItems);
    }
};

const emptyItem = (itype: ItemType): IItem => ({
    AchievedIn: null,
    Id: '',
    ItemStatus: 'NA',
    Content: '',
    ItemType: itype,
    PlannedIn: null,
    User: null,
});

async function adoptOrphanItems(
    period: IPeriod,
    items: IItem[],
    setItems: React.Dispatch<React.SetStateAction<IItem[]>>,
    ItemService: ItemService
) {
    // Objectives that are achieved but, don't have an achieved period
    const orphanItems = items.filter(
        (obj) => obj.ItemStatus === 'Achieved' && !obj.AchievedIn
    );
    // if period is open
    if (period && period.Status !== 'Finished') {
        const calls = orphanItems.map(async (obj) => {
            try {
                // if period Id is greater or equal than Planned in Period id
                if (period.ID >= obj.PlannedIn.Id) {
                    // Update the item via API
                    const updatedObjective = await ItemService.updateItem(
                        obj.Id,
                        {
                            AchievedInId: period.ID,
                        }
                    );
                    // Update the state with the new item
                    setItems((prev) =>
                        prev.map((obj) =>
                            obj.Id === updatedObjective.Id
                                ? {
                                      ...obj,
                                      AchievedIn: {
                                          Id: period.ID,
                                          Title: period.Title,
                                      },
                                  }
                                : obj
                        )
                    );
                }
            } catch (err) {
                SPnotify({
                    message: err,
                    messageType: MessageBarType.error,
                });
            }
        });
        await Promise.all(calls);
    }
}

export {
    isEmpty,
    handleItemUpdate,
    handleCreate,
    handleUpdate,
    handleDelete,
    emptyItem,
    adoptOrphanItems
};
