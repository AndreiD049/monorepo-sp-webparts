export type TaskStatus = 'Open' | 'Pending' | 'Finished' | 'Cancelled';

export default interface ITaskLogItem {
    Id: number;
    Title: string;
    Date: string;
    Status: TaskStatus;
    Time: string;
    TaskId: number;
}
