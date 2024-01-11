import { SELECTED_TEAM_CHANGE, SELECTED_USER_CHANGE } from "./constants";
import IUser from "./models/IUser";

export function selectUser(user: IUser): void {
	document.dispatchEvent(new CustomEvent(SELECTED_USER_CHANGE, { detail: { user } }));
}

export function selectTeam(team: string): void {
	document.dispatchEvent(new CustomEvent(SELECTED_TEAM_CHANGE, { detail: { team } }));
}
