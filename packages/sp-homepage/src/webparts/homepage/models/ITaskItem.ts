export type TaskStatus = 'Open' | 'Pending' | 'Finished' | 'Cancelled';

export default interface ITaskItem {
    Id: number;
    Title: string;
    Status: TaskStatus;
    Time: string;
}
