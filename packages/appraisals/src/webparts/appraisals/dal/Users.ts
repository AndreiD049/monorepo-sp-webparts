import { Caching, getNewSP } from 'sp-preset';
import { IUser } from './IUser';

export async function getCurrentUser(): Promise<IUser> {
    // Caching
    const sp = getNewSP();
    return sp.web.currentUser();
}

export async function getUserById(id: string): Promise<IUser> {
    // Caching
    const sp = getNewSP();
    return sp.web.siteUsers.getById(+id)();
}
