export interface IUser {
    ID: number;
    Title: string;
    EMail: string;
}
export interface IUserDetails {
    User: {
        ID: number;
        Title: string;
        EMail: string;
    };
    Teams?: string[];
    Role?: string;
}
