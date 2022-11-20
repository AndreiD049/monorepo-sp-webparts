import { IList, SPFI } from 'sp-preset';
import { IServiceProps } from './models/IServiceProps';
import { IUser, IUserListInfo } from './models/IUser';

const select = ['User/Id', 'User/EMail', 'User/Title', 'Role', 'Teams'];
const expand = ['User'];

export class UserService {
    private sp: SPFI;
    private usersList: IList;

    constructor(options: IServiceProps) {
        this.sp = options.sp;
        this.usersList = this.sp.web.lists.getByTitle(options.listName);
    }

    async getCurrentUser(): Promise<IUser> {
        const current = await this.sp.web.currentUser();
        const listInfo: IUserListInfo[] = await this.usersList.items
            .filter(`UserId eq ${current.Id}`)
            .select(...select)
            .expand(...expand)();
        return {
            ...current,
            ListInfo: listInfo[0],
        };
    }

    async getUserByEmail(email: string): Promise<IUser> {
        const siteUser = await this.sp.web.siteUsers.getByEmail(email)();
        const listInfo: IUserListInfo[] = await this.usersList.items
            .filter(`UserId eq ${siteUser.Id}`)
            .select(...select)
            .expand(...expand)();

        return {
            ...siteUser,
            ListInfo: listInfo[0],
        };
    }

    async getUsersByTeam(team: string): Promise<IUserListInfo[]> {
        return this.usersList.items
            .filter(`Teams eq '${team}'`)
            .select(...select)
            .expand(...expand)();
    }

    async getTeamsChoices(): Promise<string[]> {
        return (await this.usersList.fields.getByTitle('Teams')()).Choices || [];
    }
}
