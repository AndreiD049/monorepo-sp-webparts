import { IndexedDbCache, KeyAccessor } from 'indexeddb-manual-cache';
import SPBuilder, { InjectHeaders, ISiteUserInfo, SPFI } from 'sp-preset';
import IConfig from '../models/IConfig';
import IUser from '../models/IUser';
import IUserCustom from '../models/IUserCustom';

const MINUTE = 1000 * 60;

export default class UserService {
    private static spBuilder: SPBuilder;
    private static sp: SPFI;
    private static rootSp: SPFI;
    private static config: IConfig;
    private static db: IndexedDbCache;
    private static cache: {
        userByTeam: (team: string) => KeyAccessor;
        siteUsers: KeyAccessor;
        customUser: (id: number) => KeyAccessor;
        user: (id: number) => KeyAccessor;
        userByEmail: (email: string) => KeyAccessor;
        userGroups: (id: number) => KeyAccessor;
        getTeams: KeyAccessor;
    };

    public static Init(context: {}, config: IConfig): void {
        this.spBuilder = new SPBuilder(context).withRPM(600).withAdditionalTimelines([
            InjectHeaders({
                Accept: 'application/json;odata=nometadata',
            }),
        ]);

        // Cache for an hour
        this.db = new IndexedDbCache('Homepage_Cache', location.host + location.pathname, {
            expiresIn: MINUTE * 60,
        });
        this.cache = {
            userByTeam: (team: string) => this.db.key(`getCustomUsersByTeam${team}`),
            siteUsers: this.db.key(`getSiteUsers`),
            customUser: (id: number) => this.db.key(`customUser${id}`),
            user: (id: number) => this.db.key(`getUser${id}`),
            userGroups: (id: number) => this.db.key(`getUserGroups${id}`),
            userByEmail: (email: string) => this.db.key(`getUserByEmail${email}`),
            getTeams: this.db.key('getTeams'),
        };
        this.sp = this.spBuilder.getSP();
        this.rootSp = this.spBuilder.getSP();
        this.config = config;
    }

    public static async getCustomUsersByTeam(
        team: string,
        sp: SPFI = this.rootSp
    ): Promise<IUserCustom[]> {
        const list = sp.web.lists.getByTitle(this.config.users?.listName);
        const users = await this.cache
            .userByTeam(team)
            .get(async () =>
                list.items
                    .filter(`${this.config?.users.teamsColumn} eq '${team}'`)
                    .select('User/Id', 'User/Title', 'Role', this.config.users?.teamsColumn)
                    .expand('User')()
            );
        return users;
    }

    public static async getTeams(): Promise<string[]> {
        const list = this.sp.web.lists.getByTitle(this.config.users?.listName);
        const teamField = await this.cache.getTeams.get(async () => list.fields.getByTitle('Team')());
        return teamField.Choices;
    }

    public static async getSiteUsers(): Promise<ISiteUserInfo[]> {
        return this.cache.siteUsers.get(async () => this.sp.web.siteUsers());
    }

    /**
     * Get the user from custom list. Where info about role and team is stored
     * @param id
     * @returns
     */
    private static async getCustomUser(id: number): Promise<IUserCustom | null> {
        const list = this.rootSp.web.lists.getByTitle(this.config.users?.listName);
        const users = await this.cache
            .customUser(id)
            .get(
                async () =>
                    await list.items
                        .filter(`UserId eq ${id}`)
                        .select('Role', this.config.users?.teamsColumn)()
            );
        const result: IUserCustom = users[0] || null;
        if (result) {
            result.Teams = users[0][this.config.users.teamsColumn] || [];
        }
        return result;
    }

    private static async getCurrentUserId(): Promise<number> {
        return (await this.sp.web.currentUser()).Id;
    }

    public static async getCurrentUser(): Promise<IUser> {
        return this.getUser(await this.getCurrentUserId());
    }

    public static async getUser(id: number): Promise<IUser> {
        const user: IUser = await this.cache
            .user(id)
            .get(async () => this.sp.web.siteUsers.getById(id)());
        user.groups = await this.cache
            .userGroups(id)
            .get(async () => this.sp.web.siteUsers.getById(id).groups());
        const teamsInfo = await this.getCustomUser(user.Id);
        user.role = teamsInfo?.Role;
        user.teams = teamsInfo?.Teams;
        return user;
    }

    public static async getUserByEmail(email: string): Promise<IUser> {
        const user: IUser = await this.cache
            .userByEmail(email)
            .get(async () => this.sp.web.siteUsers.getByEmail(email)());
        const id = user.Id;
        user.groups = await this.cache.userGroups(id).get(async () =>
            this.sp.web.siteUsers.getById(id).groups()
        );
        const teamsInfo = await this.getCustomUser(user.Id);
        user.role = teamsInfo?.Role;
        user.teams = teamsInfo?.Teams;
        return user;
    }
}
