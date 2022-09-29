export interface ITaskComment {
    Id?: number;
    Author?: {
        Id: number;
        Title: string;
        EMail: string;
    };
    Created?: string;
    ListId: string;
    ItemId: number;
    Comment: string;
    ActivityType: 'Comment' | 'Modify' | 'Time log';
    User?: {
        Id: number;
        Title: string;
        EMail: string;
    };
    UserId?: number;
    Date?: string;
}