/* eslint-disable @typescript-eslint/no-explicit-any */
import { getAllPaged } from '@service/sp-cip';
import { IItemAddResult, IItemUpdateResult, IList, SPFI } from 'sp-preset';
import { IFeedbackItemRaw } from '../models/IFeedbackItem';
import { Item } from '../webparts/feedback/item';

export class ItemsService {
    private sp: SPFI;
    public itemsList: IList;

    constructor(sp: SPFI, listName: string) {
        this.sp = sp;
        this.itemsList = this.sp.web.lists.getByTitle(listName);
    }
    
    public async getItem(id: number): Promise<Item> {
        return new Item(await this.itemsList.items.getById(id)());
    }

    public async getAllItems(): Promise<IFeedbackItemRaw[]> {
        const items: IFeedbackItemRaw[] = await getAllPaged(
            this.itemsList.items.filter(`IsService eq '0'`).select('Id', 'Title', 'Tags', 'Fields', 'IsService').orderBy('Created', false)
        );
        return items;
    }

    public async getAllSystemItems(): Promise<IFeedbackItemRaw[]> {
        const items: IFeedbackItemRaw[] = await getAllPaged(
            this.itemsList.items.filter(`IsService eq '1'`).select('Id', 'Title', 'Tags', 'Fields', 'IsService')
        );
        return items;
    }
    
    public async addItem(item: IFeedbackItemRaw): Promise<IItemAddResult> {
        return this.itemsList.items.add(item);
    }
    
    public async updateItem(id: number, payload: Partial<IFeedbackItemRaw>): Promise<IItemUpdateResult> {
        return this.itemsList.items.getById(id).update(payload);
    }
}
