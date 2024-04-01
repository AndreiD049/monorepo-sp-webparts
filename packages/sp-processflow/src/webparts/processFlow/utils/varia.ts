import { IPersonaProps } from '@fluentui/react';

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

