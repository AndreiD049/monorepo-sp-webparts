import { ISiteUserInfo } from 'sp-preset';

export interface IUserListInfo {
    Role?: string;
    Teams?: string[];
    User: {
        Id: number;
        Title: string;
        EMail: string;
    };
}

export interface IUser extends ISiteUserInfo {
    ListInfo: IUserListInfo;
}
