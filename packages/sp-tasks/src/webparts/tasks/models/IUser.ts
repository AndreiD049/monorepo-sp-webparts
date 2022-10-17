export interface IUser {
    User: {
        ID: number;
        Title: string;
        EMail: string;
    };
    Teams: string[];
    Role: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function convertToUser(item: any, userCol: string, teamsCol: string, roleCol: string): IUser {
    return ({
        User: {
            ID: item[userCol].ID,
            EMail: item[userCol].EMail,
            Title: item[userCol].Title,
        },
        Teams: item[teamsCol],
        Role: item[roleCol],
    });
}