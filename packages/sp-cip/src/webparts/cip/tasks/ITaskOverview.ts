export const LIST_SELECT = [
    'Id',
    'Title',
    'Description',
    'Responsible/Id',
    'Responsible/Title',
    'Responsible/EMail',
    'Team',
    'Status',
    'Priority',
    'Category',
    'Progress',
    'DueDate',
    'EstimatedTime',
    'EffectiveTime',
    'ParentId',
    'MainTaskId',
    'CommentsId',
    'SubtasksId',
];

export const LIST_EXPAND = ['Responsible'];

export interface ITaskOverview {
    Id: number;
    Title: string;
    Description: string;
    Responsible: {
        Id: number;
        Title: string;
        EMail: string;
    };
    Team: string;
    Status: string;
    Priority: 'None' | 'Low' | 'Medium' | 'High';
    Progress: number;
    Category: string;
    DueDate: string; // ISO formatted date
    EstimatedTime: number; // number of hours
    EffectiveTime: number; // number of hours
    ParentId: number;
    MainTaskId?: number;
    CommentsId?: number[];
    SubtasksId?: number[];
}
