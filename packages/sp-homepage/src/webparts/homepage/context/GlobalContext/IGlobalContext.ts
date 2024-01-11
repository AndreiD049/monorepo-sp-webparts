import { IJsonConfig } from "json-configuration";
import IConfig from "../../models/IConfig";
import IUser from "../../models/IUser";
import IUserCustom from "../../models/IUserCustom";

export default interface IGlobalContext {
    config: IJsonConfig<IConfig>;
    currentUser: IUser;
	availableUsers: IUserCustom[];
    teams: string[];
    selectedUser: IUser;
    selectedTeam: string;
	canSeeAllTeams: boolean;
	canSeeTheirTeamMembers: boolean;
}
