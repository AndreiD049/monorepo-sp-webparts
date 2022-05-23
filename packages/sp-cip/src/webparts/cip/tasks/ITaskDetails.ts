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
    'Progress',
    'StartDate',
    'FinishDate',
    'DueDate',
    'EstimatedTime',
    'EffectiveTime',
    'Parent/Id',
    'Parent/Title',
    'MainTask/Id',
    'MainTask/Title',
    'CommentsId',
    'SubtasksId',
];

export const LIST_EXPAND = ['Responsible', 'Parent', 'MainTask'];

export interface ITaskDetails {
    Id: number;
    Title: string;
    Description?: string;
    Responsible: {
        Id: number;
        Title: string;
        EMail: string;
    };
    Team: string;
    Status: string;
    Priority: 'None' | 'Low' | 'Medium' | 'High';
    Progress: number;
    StartDate?: string; // ISO formatted date
    FinishDate?: string; // ISO formatted date
    DueDate: string; // ISO formatted date
    EstimatedTime: number; // number of hours
    EffectiveTime: number; // number of hours
    Parent?: Partial<ITaskDetails>;
    MainTask?: Partial<ITaskDetails>;
    CommentsId: number[];
    SubtasksId: number[];
}

export interface ICreateTask {
    Title: string;
    Description: string;
    Status?: string;
    ResponsibleId: number;
    Priority: string;
    Category?: string;
    StartDate?: string;
    DueDate: string;
    Team?: string;
    Progress?: number;
    EstimatedTime: number;
    EffectiveTime?: number;
    ParentId?: number;
    MainTaskId?: number;
}
