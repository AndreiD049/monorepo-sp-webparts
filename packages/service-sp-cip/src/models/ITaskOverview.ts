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
    'FinishDate',
    'EstimatedTime',
    'EffectiveTime',
    'ParentId',
    'MainTaskId',
    'Subtasks',
    'FinishedSubtasks',
    'CommentsCount',
    'AttachmentsCount',
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
    FinishDate: string | null; // ISO formatted date
    EstimatedTime: number; // number of hours
    EffectiveTime: number; // number of hours
    ParentId: number;
    MainTaskId?: number;
    Subtasks: number;
    FinishedSubtasks: number;
    CommentsCount?: number;
    AttachmentsCount?: number;
}

export interface ITaskNoteView {
    Title: string;
    NoteSectionName: string;
}

export interface ITaskTimingView {
    Id: number;
    ParentId: number;
    EstimatedTime: number; // number of hours
    EffectiveTime: number; // number of hours
}

export type ITaskTimingDict = {
    [parentId: number]: {
		Ids: number[];
        EstimatedTime: number;
        EffectiveTime: number;
    };
};
