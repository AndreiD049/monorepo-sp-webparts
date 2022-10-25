import { IPersonaProps, PersonaSize } from 'office-ui-fabric-react';
import { ISiteUserInfo } from 'sp-preset';

export function userToPersonaProps(users: ISiteUserInfo[]): IPersonaProps[] {
    let result = users.map((user) => {
        return {
            id: user.Id.toString(),
            text: user.Title,
            secondaryText: user.Email,
            size: PersonaSize.size24,
            imageUrl: `/_layouts/15/userphoto.aspx?AccountName=${user.Email}&Size=M`,
        };
    });
    return result;
}
