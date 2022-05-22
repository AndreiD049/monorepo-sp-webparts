export interface ITaskComment {
    Author?: {
        Id: number;
        Title: string;
    };
    Created?: string;
    ListId: string;
    ItemId: number;
    Comment: string;
    ActivityType: 'Comment' | 'Modify' | 'Time log';
}