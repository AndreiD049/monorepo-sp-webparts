import { ISiteUserInfo, SPFI } from "sp-preset";

export class UsersService {

    constructor(private sp: SPFI) { }
    
    public async getCurrentUser(): Promise<ISiteUserInfo> {
        return this.sp.web.currentUser();
    }
}