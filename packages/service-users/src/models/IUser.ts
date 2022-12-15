import { ISiteUserInfo } from 'sp-preset';

export interface IUserProps {
    Id: number;
    Title: string;
    EMail: string;
}

export interface IUserListInfo {
    Role?: string;
    Team?: string[];
    User: IUserProps;
}

export interface IUser extends ISiteUserInfo {
    ListInfo: IUserListInfo;
}
