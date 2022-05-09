import { IPersonaProps, PersonaSize } from "office-ui-fabric-react";
import { Caching } from "sp-preset";
import CipWebPart from "../CipWebPart";

export const useUsers = () => {
    const sp = CipWebPart.SPBuilder.getSP('Data').using(Caching());
    const getAll = async () => {
        return sp.web.siteUsers();
    }

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
        getPersonaProps,
    }
}