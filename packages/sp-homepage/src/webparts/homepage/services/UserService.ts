import SPBuilder, { Caching, InjectHeaders, ISiteUserInfo, SPFI } from 'sp-preset';
import IConfig from '../models/IConfig';
import IUser from '../models/IUser';
import IUserCustom from '../models/IUserCustom';

const MINUTE = 1000 * 60;

export default class UserService {
    private static spBuilder: SPBuilder;
    private static sp: SPFI;
    private static config: IConfig;

    public static Init(context: {}, config: IConfig): void {
        this.spBuilder = new SPBuilder(context)
            .withRPM(600)
            .withAdditionalTimelines([
                InjectHeaders({
                    Accept: 'application/json;odata=nometadata',
                }),
            ]);

        // Cache for an hour
        this.sp = this.spBuilder.getSP().using(Caching({
            expireFunc: () => new Date(Date.now() + MINUTE * 60)
        }));
        this.config = config;
    }

    public static async getSiteUsers(): Promise<ISiteUserInfo[]> {
        return this.sp.web.siteUsers();
    }

    /**
     * Get the user from custom list. Where info about role and team is stored
     * @param id 
     * @returns 
     */
    private static async getCustomUser(id: number): Promise<IUserCustom | null> {
        const sp = this.spBuilder.getSP(this.config.users.rootUrl);
        const list = sp.web.lists.getByTitle(this.config.users.listName);
        const users = await list.items.filter(`UserId eq ${id}`).select('Role', this.config.users.teamsColumn)();
        return users[0] || null;
    }

    public static async getUser(id: number): Promise<IUser> {
        const userRequest = this.sp.web.siteUsers.getById(id);
        const user: IUser = await userRequest()
        user.groups = await this.sp.web.siteUsers.getById(id).groups();
        const teamsInfo = await this.getCustomUser(user.Id);
        user.role = teamsInfo?.Role;
        user.teams = teamsInfo?.Teams;
        return user;
    }

    public static async getUserByEmail(email: string): Promise<IUser> {
        const user: IUser = await this.sp.web.siteUsers.getByEmail(email)();
        user.groups = await this.sp.web.siteUsers.getByEmail(email).groups();
        const teamsInfo = await this.getCustomUser(user.Id);
        user.role = teamsInfo?.Role;
        user.teams = teamsInfo?.Teams;
        return user;
    }
}