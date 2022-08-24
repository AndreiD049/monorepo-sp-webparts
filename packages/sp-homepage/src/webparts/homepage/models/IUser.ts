import { ISiteGroupInfo, ISiteUserInfo } from "sp-preset";

export default interface IUser extends ISiteUserInfo {
    teams: string[];
    role: string;
    groups: ISiteGroupInfo[];
}