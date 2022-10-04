import { IPersonaProps, PersonaSize } from "office-ui-fabric-react";
import { useContext } from "react";
import { IndexedDbCache } from 'indexeddb-manual-cache';
import { DB_NAME, STORE_NAME, HOUR } from '../utils/constants';
import { IList, ISiteUserInfo, SPFI } from "sp-preset";
import CipWebPart, { ICipWebPartProps } from "../CipWebPart";
import { GlobalContext } from "../utils/GlobalContext";

const db = new IndexedDbCache(DB_NAME, STORE_NAME, {
    expiresIn: HOUR,
});

const cache = {
    all: db.key('allUsers'),
    user: (id: number) => db.key(`user(${id})`),
    currentUser: db.key(`currentUser`),
    teams: db.key('teams'),
}

export class UserService {
    private sp: SPFI;
    private usersList: IList; 
    private teamsField: string;

    constructor(key: string, properties: ICipWebPartProps) {
        this.sp = CipWebPart.SPBuilder.getSP();
        this.usersList = this.sp.web.lists.getByTitle(properties.config?.teamsList.name);
        this.teamsField = properties.config?.teamsList.fieldName;
    }

    async getAll() {
        return cache.all.get(() => this.sp.web.siteUsers());
    }

    async getUser(id: number) {
        return cache.user(id).get(() => this.sp.web.siteUsers.getById(id)());
    }

    async getCurrentUser(): Promise<ISiteUserInfo> {
        return cache.currentUser.get(() => this.sp.web.currentUser());
    }

    async getTeams() {
        const teamsField = await cache.teams.get(() => this.usersList.fields.getByTitle(this.teamsField)());
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
