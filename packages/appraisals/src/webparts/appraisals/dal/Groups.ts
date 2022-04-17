import { Caching, SPFI } from 'sp-preset';
import AppraisalsWebPart from '../AppraisalsWebPart';
import { IUser } from './IUser';

export interface IUserGroup {
    Id: string;
    LoginName: string;
    OwnerTitle: string;
    Title: string;
}

export default class GroupService {
    private sp: SPFI;

    constructor() {
        this.sp = AppraisalsWebPart.SPBuilder.getSP().using(Caching());
    }
    async getUserGroups(): Promise<IUserGroup[]> {
        return this.sp.web.currentUser.groups();
    }
    
    async getGroupUsers(id: string): Promise<IUser[]> {
        return this.sp.web.siteGroups
            .getById(+id)
            .users();
    }
}

