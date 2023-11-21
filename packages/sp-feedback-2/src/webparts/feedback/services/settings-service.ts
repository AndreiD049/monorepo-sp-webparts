import { IList, SPFI } from "sp-preset";
import { IBaseSetting } from "../models/IBaseSetting";

class SettingsProvider {
    private list: IList;
    
    public initService(sp: SPFI, listTitle: string): void {
        this.list = sp.web.lists.getByTitle(listTitle);
    }
    
    public async getSetting(id: number): Promise<IBaseSetting> {
        return this.list.items.getById(id)();
    }
    
    public async getSettings(title: string): Promise<IBaseSetting[]> {
        return this.list.items.filter(`Title eq '${title}'`)();
    }

    public async getSettingsAs<T>(title: string): Promise<T[]> {
        return this.list.items.filter(`Title eq '${title}'`)()
			.then((settings) => settings.map((setting) => ({
				...setting,
				Data: JSON.parse(setting.Data) as T,
		})));
    }
    
    public async addSetting(setting: Partial<IBaseSetting>): Promise<IBaseSetting> {
        const added = await this.list.items.add(setting);
        return added.data as IBaseSetting;
    }
    
    public async editSetting(id: number, setting: Partial<IBaseSetting>): Promise<IBaseSetting> {
        await this.list.items.getById(id).update(setting);
        return this.getSetting(id);
    }
    
    public async deleteSetting(id: number): Promise<void> {
        await this.list.items.getById(id).delete();
    }
}

export const SettingsService = new SettingsProvider();
