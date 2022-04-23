import { ISiteUser, ISiteUserInfo } from "sp-preset";

export default interface IUserFolder {
    GUID: string;
    Id: number;
    Title: string;
    folderUser?: ISiteUserInfo;
    Users?: ISiteUserInfo[];
}