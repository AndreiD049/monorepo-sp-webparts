import { uniqBy } from '@microsoft/sp-lodash-subset';
import SPBuilder, { Caching, InjectHeaders, ISiteUserInfo, SPFI } from 'sp-preset';
import IConfig from '../models/IConfig';
import IUser from '../models/IUser';
import IUserCustom from '../models/IUserCustom';

const MINUTE = 1000 * 60;

export default class UserService {
    private static spBuilder: SPBuilder;
    private static sp: SPFI;
    private static rootSp: SPFI;
    private static config: IConfig;

    public static Init(context: {}, config: IConfig): void {
        this.spBuilder = new SPBuilder(context).withRPM(600).withAdditionalTimelines([
            InjectHeaders({
                Accept: 'application/json;odata=nometadata',
            }),
        ]);

        // Cache for an hour
        this.sp = this.spBuilder.getSP().using(
            Caching({
                expireFunc: () => new Date(Date.now() + MINUTE * 60),
            })
        );
        this.rootSp = this.spBuilder.getSP().using(
            Caching({
                expireFunc: () => new Date(Date.now() + MINUTE * 60),
            })
        );
        this.config = config;
    }

    public static async getCurrentUserTeamMembers(): Promise<IUserCustom[]> {
        const current = await this.getCurrentUser();
        const result: IUserCustom[] = [];
        if (current.teams.length === 1) {
            return this.getCustomUsersByTeam(current.teams[0]);
        } else if (current.teams.length > 1) {
            const [batchedSP, execute] = this.rootSp.batched();
            current.teams.forEach(async (team) => {
                const users = await this.getCustomUsersByTeam(team, batchedSP)
                result.push(...users);
            });
            await execute();
        }
        return uniqBy(result, (u) => u.User.Id);
    }

    public static async getCustomUsersByTeam(
        team: string,
        sp: SPFI = this.rootSp
    ): Promise<IUserCustom[]> {
        const list = sp.web.lists.getByTitle(this.config.users?.listName);
        const users = await list.items
            .filter(`${this.config?.users.teamsColumn} eq '${team}'`)
            .select('User/Id', 'User/Title', 'Role', this.config.users?.teamsColumn)
            .expand('User')();
        return users;
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
        const list = this.rootSp.web.lists.getByTitle(this.config.users?.listName);
        const users = await list.items
            .filter(`UserId eq ${id}`)
            .select('Role', this.config.users?.teamsColumn)();
        return users[0] || null;
    }

    private static async getCurrentUserId(): Promise<number> {
        return (await this.sp.web.currentUser()).Id;
    }

    public static async getCurrentUser(): Promise<IUser> {
        return this.getUser(await this.getCurrentUserId());
    }

    public static async getUser(id: number): Promise<IUser> {
        const userRequest = this.sp.web.siteUsers.getById(id);
        const user: IUser = await userRequest();
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
