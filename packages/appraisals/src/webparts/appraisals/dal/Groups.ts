import { sp } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/site-users/web";
import { IUser } from "./IUser";

export interface IUserGroup {
    Id: string;
    LoginName: string;
    OwnerTitle: string;
    Title: string;
}

export async function getUserGroups(): Promise<IUserGroup[]> {
    return sp.web.currentUser.groups.usingCaching().get();
}

export async function getGroupUsers(id: string): Promise<IUser[]> {
    return sp.web.siteGroups.getById(+id).users.usingCaching().get();
}
