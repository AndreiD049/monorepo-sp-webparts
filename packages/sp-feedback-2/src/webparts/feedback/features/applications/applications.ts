import { IBaseSetting } from '../../models/IBaseSetting';
import { SettingsService } from '../../services/settings-service';
import { IApplication } from './IApplication';

const APPLICATIONS_TITLE = 'APPLICATION';

export async function getApplications(): Promise<IApplication[]> {
    const appsRaw = await SettingsService.getSettings(APPLICATIONS_TITLE);
    const apps: IApplication[] = appsRaw.map((app) => parseApplication(app));
    return apps;
}

export async function addApplication(Data: IApplication['Data']): Promise<IApplication> {
    const app: Partial<IBaseSetting> = {
        Title: APPLICATIONS_TITLE,
        Data: JSON.stringify(Data),
    };
    return parseApplication(await SettingsService.addSetting(app));
}

export async function editApplication(id: number, Data: IApplication['Data']): Promise<IApplication> {
    const app: Partial<IBaseSetting> = {
        Data: JSON.stringify(Data),
    };
    return parseApplication(await SettingsService.editSetting(id, app));
}

function parseApplication(app: IBaseSetting): IApplication {
    return {
        ...app,
        Data: JSON.parse(app.Data) as IApplication['Data'],
    };
}
