import { IPersonaProps, PersonaSize } from 'office-ui-fabric-react';
import { IList, ISiteUserInfo, SPFI } from 'sp-preset';
import CipWebPart, { ICipWebPartProps } from '../CipWebPart';

export class UserService {
    private sp: SPFI;
    private usersList: IList;
    private teamsField: string;

    constructor(key: string, properties: ICipWebPartProps) {
        this.sp = CipWebPart.SPBuilder.getSP();
        this.usersList = this.sp.web.lists.getByTitle(
            properties.config?.teamsList.name
        );
        this.teamsField = properties.config?.teamsList.fieldName;
    }

    async getAll(): Promise<ISiteUserInfo[]> {
        return this.sp.web.siteUsers();
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async getCustomListUsers(): Promise<any[]> {
        return this.usersList.items
            .select('Id', 'User/Id', 'User/Title', 'User/EMail')
            .expand('User')();
    }

    async getUser(id: number): Promise<ISiteUserInfo> {
        return this.sp.web.siteUsers.getById(id)();
    }

    async getCurrentUser(): Promise<ISiteUserInfo> {
        return this.sp.web.currentUser();
    }

    async getTeams(): Promise<string[]> {
        const teamsField = await this.usersList.fields.getByTitle(this.teamsField)();
        return teamsField.Choices;
    }

    async getPersonaProps(
        withEveryone: boolean = true
    ): Promise<IPersonaProps[]> {
        const everyone = withEveryone && await this.sp.web.siteUsers.filter(
            `Title eq 'Everyone'`
        )();
        const users = await this.getCustomListUsers();
        let result = users.map((user) => {
            return {
                id: user.User.Id.toString(),
                text: user.User.Title,
                secondaryText: user.User.EMail,
                size: PersonaSize.size24,
                imageUrl: `/_layouts/15/userphoto.aspx?AccountName=${user.User.EMail}&Size=M`,
            };
        });
        if (withEveryone) {
            result = result.concat({
                id: everyone[0].Id.toString(),
                text: everyone[0].Title,
                secondaryText: everyone[0].Email,
                size: PersonaSize.size24,
                imageUrl: `/_layouts/15/userphoto.aspx?AccountName=${everyone[0].Email}&Size=M`,
            });
        }
        return result;
    }
}
