import { ISiteUserInfo, SPFI } from "sp-preset";

class UserServiceProvider {
	private sp: SPFI;

	public initService(sp: SPFI): void {
		this.sp = sp;
	}

	public async getCurrentUser(): Promise<ISiteUserInfo> {
		const result = await this.sp.web.currentUser();
		return result;
	}
}

export const UserService = new UserServiceProvider();
