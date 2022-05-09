export const LIST_SELECT = [
    'Id',
    'Title',
    'Responsible/Id',
    'Responsible/Title',
    'Responsible/EMail',
    'Team',
    'Status',
    'Priority',
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
    Responsible: {
        Id: number;
        Title: string;
        EMail: string;
    };
    Team: string;
    Status: string;
    Priority: 'None' | 'Low' | 'Medium' | 'High';
    Progress: number;
    DueDate: string; // ISO formatted date
    EstimatedTime: number; // number of hours
    EffectiveTime: number; // number of hours
    ParentId: number;
    MainTaskId?: number;
    CommentsId?: number[];
    SubtasksId?: number[];
}
