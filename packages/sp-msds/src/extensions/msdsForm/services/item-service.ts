import { IItemAddResult, IList, SPFI } from "sp-preset";
import { IMSDSRequest } from "./IMSDSRequest";

export class ItemService {
    private static sp: SPFI;
    private static applicationList: IList;

    public static InitService(sp: SPFI): void {
        this.sp = sp;
        this.applicationList = this.sp.web.lists.getByTitle("Web application form");
    }

    public static async createItem(payload: Partial<IMSDSRequest>): Promise<IItemAddResult> {
        const cleanedPayload = {...payload};
        delete cleanedPayload.CustomerName;
        return this.applicationList.items.add(cleanedPayload);
    }
}