import { SettingsService } from "../../services/settings-service";

export interface IRequestType {
	ID: number;
	Data: {
		code: string;
		name: string;
		imageUrl: string;
	}
}

const REQUEST_TYPE_TITLE = "REQUEST_TYPE";

export async function getRequestTypes(): Promise<IRequestType[]> {
	const requestTypes = await SettingsService.getSettingsAs<IRequestType>(REQUEST_TYPE_TITLE);
	return requestTypes;
}
