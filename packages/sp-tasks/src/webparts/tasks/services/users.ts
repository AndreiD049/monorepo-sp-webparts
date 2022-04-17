import { SPFI, Caching, ISiteUserInfo } from 'sp-preset';
import TasksWebPart from '../TasksWebPart';

export default class UserService {
    sp: SPFI;
    usersSP: SPFI;

    constructor() {
        this.sp = TasksWebPart.SPBuilder.getSP().using(Caching());
    }

    async getSiteUsers() {
        return this.sp.web.siteUsers();
    }

    async getUser(title: string) {
        return (await this.getSiteUsers()).find((u) => u.Title === title);
    }

    async getCurrentUser(): Promise<ISiteUserInfo> {
        return this.sp.web.currentUser();
    }
}
