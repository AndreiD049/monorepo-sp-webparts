import { format } from 'office-ui-fabric-react';
import IItem, { ItemStatus, ItemType } from '../../dal/IItem';
import { createItem, deleteItem, updateItem } from '../../dal/Items';
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
    const result = await createItem({
        Content: item.Content,
        ItemStatus: status,
        ItemType: itemType,
        PlannedInId: periodId,
        AchievedInId:
            status === 'Achieved' || status === 'NA' ? periodId : null,
        UserId: userId,
    });
    setItems({
        action: 'create',
        item: result,
        id: result.Id,
    });
};

const handleUpdate = async (
    id: string,
    item: Partial<IItem>,
    setItems: (old: any) => any
) => {
    const result = await updateItem(id, item);
    setItems({
        action: 'update',
        item: result,
        id: result.Id,
    });
};

const handleDelete = async (id: string, setItems: (old: any) => any) => {
    await deleteItem(id);
    setItems({
        action: 'delete',
        id: id,
    });
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
    if (isEmpty(item) && newValue !== '') {
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

export {
    isEmpty,
    handleItemUpdate,
    handleCreate,
    handleUpdate,
    handleDelete,
    emptyItem,
};
