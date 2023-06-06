import { IList, SPFI } from "sp-preset";
import { IBaseSetting } from "../models/IBaseSetting";

class SettingsProvider {
    private list: IList;
    
    public initService(sp: SPFI, listTitle: string): void {
        this.list = sp.web.lists.getByTitle(listTitle);
    }
    
    public async getSettings(title: string): Promise<IBaseSetting[]> {
        return this.list.items.filter(`Title eq '${title}'`)();
    }
}

export const SettingsService = new SettingsProvider();