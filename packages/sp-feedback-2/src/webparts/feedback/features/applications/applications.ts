import { IBaseSetting } from '../../models/IBaseSetting';
import { SettingsService } from '../../services/settings-service';
import { IApplication } from './IApplication';

const APPLICATIONS_TITLE = 'APPLICATION';

export async function getApplications(): Promise<IApplication[]> {
    const appsRaw = await SettingsService.getSettings(APPLICATIONS_TITLE);
    const apps: IApplication[] = appsRaw.map((app) => parseApplication(app));
    return apps;
}

function parseApplication(app: IBaseSetting): IApplication {
    return {
        ...app,
        Data: JSON.parse(app.Data) as IApplication['Data'],
    };
}
