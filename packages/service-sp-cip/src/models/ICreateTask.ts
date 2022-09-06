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
    Subtasks: number;
    FinishedSubtasks: number;
    CommentsCount?: number;
    AttachmentsCount?: number;
}
