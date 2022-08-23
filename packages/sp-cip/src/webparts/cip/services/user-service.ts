import { IPersonaProps, PersonaSize } from "office-ui-fabric-react";
import { useContext } from "react";
import { IndexedDBCacher } from "sp-indexeddb-caching";
import { IList, ISiteUserInfo, SPFI } from "sp-preset";
import CipWebPart, { ICipWebPartProps } from "../CipWebPart";
import { GlobalContext } from "../utils/GlobalContext";

const HOUR = 1000 * 60 * 60;

export class UserService {
    private sp: SPFI;
    private usersList: IList; 
    private teamsField: string;

    constructor(key: string, properties: ICipWebPartProps) {
        const { CachingTimeline } = IndexedDBCacher({
            expireFunction: () => new Date(Date.now() + HOUR),
        });
        this.sp = CipWebPart.SPBuilder.getSP().using(CachingTimeline);
        this.usersList = this.sp.web.lists.getByTitle(properties.config?.teamsList.name);
        this.teamsField = properties.config?.teamsList.fieldName;
    }

    async getAll() {
        return this.sp.web.siteUsers();
    }

    async getUser(id: number) {
        return this.sp.web.siteUsers.getById(id)();
    }

    getCurrentUser(): Promise<ISiteUserInfo> {
        return this.sp.web.currentUser();
    }

    async getTeams() {
        const teamsField = await this.usersList.fields.getByTitle(this.teamsField)();
        return teamsField.Choices;
    };

    async getPersonaProps(): Promise<IPersonaProps[]> {
        const users = await this.getAll();
        return users.map((user) => {
            return {
                id: user.Id.toString(),
                text: user.Title,
                secondaryText: user.Email,
                size: PersonaSize.size24,
                imageUrl: `/_layouts/15/userphoto.aspx?AccountName=${user.Email}&Size=M`
            }
        });
    };
}