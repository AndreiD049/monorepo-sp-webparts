import { IBaseSetting } from '../../models/IBaseSetting';
import { SettingsService } from '../../services/settings-service';

export interface ICountry {
    ID: number;
    Data: {
        name: string;
        code: string;
    };
}

const COUNTRY_TITLE = 'COUNTRY';

export async function getCountries(): Promise<ICountry[]> {
    const countriesRaw = await SettingsService.getSettings(COUNTRY_TITLE);
    const countries: ICountry[] = countriesRaw
        .map((app) => parseApplication(app))
        .sort((a, b) => a.Data.name.localeCompare(b.Data.name));
    return countries;
}

function parseApplication(app: IBaseSetting): ICountry {
    return {
        ...app,
        Data: JSON.parse(app.Data) as ICountry['Data'],
    };
}
