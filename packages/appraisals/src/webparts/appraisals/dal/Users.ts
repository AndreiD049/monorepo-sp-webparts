import { Caching, SPFI } from 'sp-preset';
import AppraisalsWebPart from '../AppraisalsWebPart';
import { IUser } from './IUser';


export default class UserService {
    private sp: SPFI;

    constructor() {
        this.sp = AppraisalsWebPart.SPBuilder.getSP().using(Caching());
    }
    
    async getCurrentUser(): Promise<IUser> {
        return this.sp.web.currentUser();
    }
    
    async getUserById(id: string): Promise<IUser> {
        return this.sp.web.siteUsers.getById(+id)();
    }
}
