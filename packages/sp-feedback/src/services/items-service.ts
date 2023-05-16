/* eslint-disable @typescript-eslint/no-explicit-any */
import { getAllPaged } from '@service/sp-cip';
import { IItemAddResult, IItemUpdateResult, IList, SPFI } from 'sp-preset';
import { IFeedbackItemRaw } from '../models/IFeedbackItem';
import { Item } from '../webparts/feedback/item';

const SELECT = ['Id', 'Title', 'Tags', 'Fields', 'IsService', 'Created', 'Author/Id', 'Author/EMail', 'Author/Title', 'Modified']
const EXPAND = ['Author']

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
            this.itemsList.items.filter(`IsService eq '0'`).select(...SELECT).expand(...EXPAND)
        );
        return items.map((i) => new Item(i));
    }

    public async getAllSystemItems(): Promise<IFeedbackItemRaw[]> {
        const items: IFeedbackItemRaw[] = await getAllPaged(
            this.itemsList.items.filter(`IsService eq '1'`).select(...SELECT).expand(...EXPAND)
        );
        return items;
    }
    
    public async addItem(item: IFeedbackItemRaw): Promise<IItemAddResult> {
        return this.itemsList.items.add(item);
    }
    
    public async updateItem(id: number, payload: Partial<IFeedbackItemRaw>): Promise<IItemUpdateResult> {
        const cleanedPayload: Partial<IFeedbackItemRaw> = {
            ...payload,
            Author: undefined,
            ID: undefined,
        };
        return this.itemsList.items.getById(id).update(cleanedPayload);
    }

    public async deleteItem(id: number): Promise<void> {
        return this.itemsList.items.getById(id).delete();
    }
}
