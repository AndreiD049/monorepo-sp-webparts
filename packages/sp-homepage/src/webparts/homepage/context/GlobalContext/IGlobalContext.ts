import { IJsonConfig } from "json-configuration";
import IConfig from "../../models/IConfig";
import IUser from "../../models/IUser";

export default interface IGlobalContext {
    config: IJsonConfig<IConfig>;
    currentUser: IUser;
    selectedUser: IUser;
    selectedTeam: string;
}