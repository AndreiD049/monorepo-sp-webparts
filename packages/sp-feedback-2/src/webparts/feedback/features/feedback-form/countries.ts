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
    const countries = await SettingsService.getSettingsAs<ICountry>(COUNTRY_TITLE);
    return countries.sort((a, b) => a.Data.name.localeCompare(b.Data.name));
}

