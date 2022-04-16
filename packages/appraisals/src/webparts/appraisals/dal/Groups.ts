import { Caching, getNewSP } from 'sp-preset';
import { IUser } from './IUser';

export interface IUserGroup {
    Id: string;
    LoginName: string;
    OwnerTitle: string;
    Title: string;
}

export async function getUserGroups(): Promise<IUserGroup[]> {
    // Caching
    const sp = getNewSP();
    return sp.web.currentUser.groups();
}

export async function getGroupUsers(id: string): Promise<IUser[]> {
    // Caching
    const sp = getNewSP();
    return sp.web.siteGroups
        .getById(+id)
        .users();
}
