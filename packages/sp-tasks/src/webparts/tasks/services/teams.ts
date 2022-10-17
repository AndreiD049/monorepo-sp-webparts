import { SPFI, IItems, IList, Caching } from 'sp-preset';
import { convertToUser, IUser } from '../models/IUser';
import TasksWebPart from '../TasksWebPart';
import { HOUR } from '../utils/constants';
import ITeams from '../utils/ITeams';
import UserService from './users';

const LIST_NAME_RE = /^.*sharepoint.com\/(sites|teams)\/.*\/(\w+)$/;

export default class TeamService {
    usersSP: SPFI;
    userService: UserService;
    list: IList;
    select: string[];
    expand: string[];

    constructor(
        url: string,
        private userCol: string,
        private teamCol: string,
        private roleCol: string
    ) {
        this.userService = new UserService();
        this.usersSP = TasksWebPart.SPBuilder.getSP('Users').using(
            Caching({
                expireFunc: () =>
                    new Date(new Date().getTime() + HOUR),
            })
        );
        const listName = url?.match(LIST_NAME_RE)[2];
        this.list = this.usersSP.web.lists.getByTitle(listName);
        this.select = [
            `${userCol}/ID`,
            `${userCol}/Title`,
            `${userCol}/EMail`,
            teamCol,
            roleCol,
        ];
        this.expand = [userCol];
    }

    async getCurrentUser(): Promise<IUser> {
        const currentUser = await this.userService.getCurrentUser();
        return convertToUser(
            (
                await this._wrap(
                    this.list.items
                        .filter(`${this.userCol}Id eq ${currentUser.Id}`)
                        .top(1)
                )()
            )[0],
            this.userCol,
            this.teamCol,
            this.roleCol
        );
    }

    async getCurrentUserTeamMembers(): Promise<ITeams<IUser>> {
        const currentUser = await this.getCurrentUser();

        const filter = currentUser.Teams.map(
            (t) => `${this.teamCol} eq '${t}'`
        ).join(' or ');
        const members = this._wrap(
            this.list.items.filter(
                `(${filter}) and ${this.userCol}Id ne ${currentUser.User.ID}`
            )
        )();
        const users = await members.then((users) =>
            users.map((user) =>
                convertToUser(user, this.userCol, this.teamCol, this.roleCol)
            )
        );
        return this.createTeams(users);
    }

    async getAllUserTeams(): Promise<ITeams<IUser>> {
        const currentUser = await this.getCurrentUser();
        const members = this._wrap(
            this.list.items.filter(
                `${this.userCol}Id ne ${currentUser.User.ID}`
            )
        )();
        const users = await members.then((users) =>
            users.map((user) =>
                convertToUser(user, this.userCol, this.teamCol, this.roleCol)
            )
        );
        return this.createTeams(users);
    }

    private async createTeams(users: IUser[]): Promise<ITeams<IUser>> {
        const result: ITeams<IUser> = {
            "All": users,
        };
        users.forEach((user) => {
            user.Teams.forEach((team) => {
                if (result[team] === undefined) {
                    result[team] = [];
                }
                result[team].push(user);
            });
        });
        return result;
    }

    private _wrap(items: IItems) {
        return items.select(...this.select).expand(...this.expand);
    }
}
