import { TaskStatus } from "./ITaskLog";

export interface ITaskInfo {
    description: string;
    remark?: string;
    title: string;
    user: {
        Title: string;
        EMail: string;
        ID: number;
    }
    date: string;
    time: string;
    status: TaskStatus;
    category?: string;
}
