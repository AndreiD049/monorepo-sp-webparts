import IItem, { ItemType } from './IItem';
import { getSP, getNewSP } from 'sp-preset';

const LIST_NAME = 'Appraisal items';
const SELECT = [
    'Id',
    'Content',
    'ItemType',
    'ItemStatus',
    'User/Title',
    'PlannedIn/Id',
    'PlannedIn/Title',
    'AchievedIn/Id',
    'AchievedIn/Title',
];
const EXPAND = ['User', 'PlannedIn', 'AchievedIn'];


/**
 *  Get items of a certain type for a user/period
 */
export async function getItems(
    itemType: ItemType,
    periodId: string,
    userId: string
): Promise<IItem[]> {
    const sp = getNewSP();
    return sp.web.lists
        .getByTitle(LIST_NAME)
        .items.filter(
            `(UserId eq '${userId}') and
             (ItemType eq '${itemType}') and
             (PlannedInId le ${periodId}) and
             ((AchievedInId ge ${periodId}) or (AchievedInId eq null))`
        )
        .select(...SELECT)
        .expand(...EXPAND)();
}

/**
 *  Get items of a certain type for a user/period
 */
export async function getSwotItems(
    periodId: string,
    userId: string
): Promise<IItem[]> {
    const sp = getNewSP();
    return sp.web.lists
        .getByTitle(LIST_NAME)
        .items.filter(
            `(UserId eq '${userId}') and
             (ItemStatus eq 'NA') and
             (ItemType ne 'Feedback') and
             (PlannedInId le ${periodId}) and
             ((AchievedInId ge ${periodId}) or (AchievedInId eq null))`
        )
        .select(...SELECT)
        .expand(...EXPAND)();
}

export interface ICreateItem
    extends Omit<IItem, 'User' | 'PlannedIn' | 'AchievedIn' | 'Id'> {
    UserId: string;
    PlannedInId: string;
    AchievedInId: string;
}

/**
 * Create appraisal item for a given user/period
 */
export async function createItem(item: ICreateItem): Promise<IItem> {
    const sp = getNewSP();
    const created = await sp.web.lists.getByTitle(LIST_NAME).items.add(item);
    return created.item
        .select(...SELECT)
        .expand(...EXPAND)();
}

export type IUpdateItem = Partial<
    { AchievedInId: string } & Pick<IItem, 'Content' | 'ItemStatus'>
>;

/**
 * Update an item, only Content, AchievedInId or ItemStatus Properties can be updated
 */
export async function updateItem(
    id: string,
    update: IUpdateItem
): Promise<IItem> {
    const sp = getNewSP();
    const result = await sp.web.lists
        .getByTitle(LIST_NAME)
        .items.getById(+id)
        .update(update);
    return result.item
        .select(...SELECT)
        .expand(...EXPAND)();
}

export async function deleteItem(id: string): Promise<void> {
    const sp = getNewSP();
    return sp.web.lists
        .getByTitle(LIST_NAME)
        .items.getById(+id)
        .delete();
}
