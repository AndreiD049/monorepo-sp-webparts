import {
    IFeedbackItem,
    IFeedbackItemRaw,
    IFields,
    isRaw,
} from '../models/IFeedbackItem';
import { Item } from '../webparts/feedback/item';

const PREFIX = 'FB:/Temp/Item';

export function fromRaw(item: IFeedbackItemRaw): IFeedbackItem {
    let fields: IFields;
    try {
        fields = JSON.parse(item.Fields);
    } catch {
        fields = {};
    }
    return {
        ...item,
        Fields: fields,
    };
}

export class TempItemsService {
    public getTempItem(title: string): Item {
        try {
            const item: string = localStorage.getItem(this.getKey(title));
            if (!item) return null;
            return new Item(JSON.parse(item));
        } catch (err) {
            console.error(err);
            return null;
        }
    }

    public getAllTempItems(): Item[] {
        const result: IFeedbackItem[] = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith(PREFIX)) {
                const fbItem = JSON.parse(localStorage.getItem(key));
                result.push(new Item(fbItem));
            }
        }
        return result.map((i) => new Item(i));
    }

    public addTempItem(item: IFeedbackItem | IFeedbackItemRaw): void {
        let target = item;
        if (isRaw(item)) {
            target = fromRaw(item);
        }
        localStorage.setItem(`${PREFIX}/${target.Title}`, JSON.stringify(target));
    }

    public updateItem(
        title: string,
        payload: Partial<IFeedbackItem>
    ): void {
        try {
            const item = this.getTempItem(title);
            const resultPayload = item.merge(payload);
            if (item) {
                localStorage.setItem(
                    this.getKey(title),
                    JSON.stringify(resultPayload)
                );
            } else {
                throw new Error(`Temporary item '${title}' does not exist.`);
            }
        } catch (err) {
            console.error(err);
        }
    }

    private getKey(title: string): string {
        return `${PREFIX}/${title}`;
    }
}
