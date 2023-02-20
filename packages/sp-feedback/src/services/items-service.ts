/* eslint-disable @typescript-eslint/no-explicit-any */
import { getAllPaged } from '@service/sp-cip';
import { IItemAddResult, IList, SPFI } from 'sp-preset';
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

    public async getAllItems(): Promise<Item[]> {
        const items: IFeedbackItemRaw[] = await getAllPaged(
            this.itemsList.items.select('Id', 'Title', 'Tags', 'Fields')
        );
        return items.map((i) => new Item(i));
    }
    
    public async addItem(item: IFeedbackItemRaw): Promise<IItemAddResult> {
        return this.itemsList.items.add(item);
    }
}
