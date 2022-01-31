import { sp } from '@pnp/sp';
import '@pnp/sp/webs';
import '@pnp/sp/site-users/web';
import '@pnp/sp/site-groups';
import { IUser } from './IUser';

export async function getCurrentUser(): Promise<IUser> {
    return sp.web.currentUser();
}

export async function getUserById(id: string): Promise<IUser> {
    return sp.web.siteUsers.getById(+id).usingCaching().get();
}
