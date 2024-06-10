import { IPersonaProps } from '@fluentui/react';
import { IUserListInfo } from '@service/users';

type ITeamUser = { User: { Title: string; EMail: string; Id: number } };

export const getTeamPersonaProps: (t: ITeamUser[]) => (IPersonaProps & { data: number })[] = (
    teamUsers: ITeamUser[]
) => {
    return teamUsers.map((u) => {
        return {
            text: u.User.Title,
            secondaryText: u.User.EMail,
            data: u.User.Id,
            imageUrl: `/_layouts/15/userphoto.aspx?accountname=${u.User.EMail}&Size=M`,
        };
    });
};

// Team leaders are set first in the list
const TL_RG = /TL|Team Lead(er)?/i;

export const sortUsers = (users: IUserListInfo[]): IUserListInfo[] => {
	let copy = [...users];
	copy = copy.sort((u1, u2) => {
		if (TL_RG.test(u1.Role)) {
			return -1
		}
		if (TL_RG.test(u2.Role)) {
			return 1
		}
		return u1.User.Id - u2.User.Id;
	})
	return copy;
}
