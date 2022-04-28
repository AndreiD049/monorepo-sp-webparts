export default interface ITask {
    Id: number;
    Title: string;
    Description?: string;
    Responsible: {
        Id: number;
        Title: string;
        EMail: string;
        LoginName: string;
    },
    Team: string;
    Status: string;
    Progress: number;
    StartDate?: string; // ISO formatted date
    FinishDate?: string; // ISO formatted date
    DueDate: string; // ISO formatted date
    EstimatedTime: number; // number of hours
    EffectiveTime: number; // number of hours
    Parent?: Partial<ITask>;
    MainTask?: Partial<ITask>;
}