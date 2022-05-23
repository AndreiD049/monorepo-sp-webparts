import { IPersonaProps, PersonaSize } from "office-ui-fabric-react";
import { useContext } from "react";
import { IndexedDBCacher } from "sp-indexeddb-caching";
import CipWebPart, { ICipWebPartProps } from "../CipWebPart";
import { GlobalContext } from "../utils/GlobalContext";
import { useChoiceFields } from "../utils/useChoiceFields";

const HOUR = 1000 * 60 * 60;

export const useUsers = (props?: { properties: ICipWebPartProps }) => {
    const { properties } = props || useContext(GlobalContext);
    const { Cache, CachingTimeline } = IndexedDBCacher({
        expireFunction: () => new Date(Date.now() + HOUR),
    });
    const sp = CipWebPart.SPBuilder.getSP().using(CachingTimeline);
    const usersList = sp.web.lists.getByTitle(properties.teamsList);

    const getAll = async () => {
        return sp.web.siteUsers();
    }

    const getTeams = async () => {
        const teamsField = await usersList.fields.getByTitle(properties.teamsField)();
        return teamsField.Choices;
    };

    const getPersonaProps: () => Promise<IPersonaProps[]> = async () => {
        const users = await getAll();
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

    return {
        getAll,
        getTeams,
        getPersonaProps,
    }
}