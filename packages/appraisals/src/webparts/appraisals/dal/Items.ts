import IItem, { ItemType } from './IItem';
import { SPFI } from 'sp-preset';
import AppraisalsWebPart from '../AppraisalsWebPart';

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

export interface ICreateItem
    extends Omit<IItem, 'User' | 'PlannedIn' | 'AchievedIn' | 'Id'> {
    UserId: string;
    PlannedInId: string;
    AchievedInId: string;
}

export type IUpdateItem = Partial<
    { AchievedInId: string } & Pick<IItem, 'Content' | 'ItemStatus'>
>;

export default class ItemService {
    private sp: SPFI;

    constructor() {
        this.sp = AppraisalsWebPart.SPBuilder.getSP();
    }

    /**
     *  Get items of a certain type for a user/period
     */
    async getItems(
        itemType: ItemType,
        periodId: string,
        userId: string
    ): Promise<IItem[]> {
        return this.sp.web.lists
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
    async getSwotItems(periodId: string, userId: string): Promise<IItem[]> {
        const sp = AppraisalsWebPart.SPBuilder.getSP();
        return this.sp.web.lists
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

    /**
     * Create appraisal item for a given user/period
     */
    async createItem(item: ICreateItem): Promise<IItem> {
        const created = await this.sp.web.lists
            .getByTitle(LIST_NAME)
            .items.add(item);
        return created.item.select(...SELECT).expand(...EXPAND)();
    }

    /**
     * Update an item, only Content, AchievedInId or ItemStatus Properties can be updated
     */
    async updateItem(id: string, update: IUpdateItem): Promise<IItem> {
        const result = await this.sp.web.lists
            .getByTitle(LIST_NAME)
            .items.getById(+id)
            .update(update);
        return result.item.select(...SELECT).expand(...EXPAND)();
    }

    async deleteItem(id: string): Promise<void> {
        return this.sp.web.lists
            .getByTitle(LIST_NAME)
            .items.getById(+id)
            .delete();
    }
}
