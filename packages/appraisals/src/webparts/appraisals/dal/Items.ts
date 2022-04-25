import IItem, { ItemType } from './IItem';
import { IList, SPFI } from 'sp-preset';
import AppraisalsWebPart from '../AppraisalsWebPart';
import UserService from './Users';
import { Guid } from '@microsoft/sp-core-library';
import { ThemeSettingName } from 'office-ui-fabric-react';

export const LIST_NAME = 'Appraisal items';
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
    User: string;
    PlannedIn: string;
    AchievedIn: string;
    GUID?: string;
}

export type IUpdateItem = Partial<
    { AchievedInId: string } & Pick<IItem, 'Content' | 'ItemStatus'>
>;

export default class ItemService {
    private sp: SPFI;
    private list: IList;
    private parentWebUrl: string;
    private listTitle: string;
    private userService: UserService;

    constructor() {
        this.sp = AppraisalsWebPart.SPBuilder.getSP();
        this.list = this.sp.web.lists.getByTitle(LIST_NAME);
        this.userService = new UserService();
    }

    async getItemByGuid(guid: string, userId: number) {
        return this.list.items.filter(`GUID eq '${guid}' and UserId eq ${userId}`)
            .select(...SELECT)
            .expand(...EXPAND)();
    }

    /**
     *  Get items of a certain type for a user/period
     */
    async getItems(
        itemType: ItemType,
        periodId: string,
        userId: string
    ): Promise<IItem[]> {
        return this.list
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
        return this.list
            .items.filter(
                `(UserId eq '${userId}') and
                (ItemStatus eq 'NA') and
                (ItemType ne 'Feedback') and
                (PlannedInId le ${periodId}) and
                ((AchievedInId ge ${periodId}) or 
                (AchievedInId eq null))`
            )
            .select(...SELECT)
            .expand(...EXPAND)();
    }

    /**
     * Create appraisal item for a given user/period
     */
    async createItem(item: ICreateItem): Promise<IItem> {
        const user = await this.userService.getUserById(item.User);
        item.User = JSON.stringify([{Key: user.LoginName }]);
        await this.ensureListInfo();
        // Generate a guid so you can find the item later
        const guid = Guid.newGuid().toString();
        item.GUID = guid;
        // construct form values
        const formValues = this.createFormValues(item);
        // Create item in folder
        await this.list.addValidateUpdateItemUsingPath(formValues, `${this.parentWebUrl}/Lists/${this.listTitle}/${user.Title}`, false)
        const result = await this.getItemByGuid(guid, +user.Id);
        return result[0];
    }

    /**
     * Update an item, only Content, AchievedInId or ItemStatus Properties can be updated
     */
    async updateItem(id: string, update: IUpdateItem): Promise<IItem> {
        const result = await this.list
            .items.getById(+id)
            .update(update);
        return result.item.select(...SELECT).expand(...EXPAND)();
    }

    async deleteItem(id: string): Promise<void> {
        return this.list
            .items.getById(+id)
            .delete();
    }

    async getFolders() {
        return this.list.rootFolder.folders();
    }

    private async ensureListInfo() {
        if (!this.parentWebUrl) {
            const listInfo = await this.list.select('Title', 'ParentWebUrl')();
            this.parentWebUrl = listInfo.ParentWebUrl;
            this.listTitle = listInfo.Title;
        }
    }

    private createFormValues(item: any) {
        const keys = Object.keys(item);
        const result = [];
        for (const key of keys) {
            if (item[key]) {
                result.push({
                    FieldName: key,
                    FieldValue: item[key].toString(),
                });
            }
        }
        return result;
    }
}
