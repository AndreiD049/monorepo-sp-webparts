import { ITaskOverview } from "./models/ITaskOverview";

export const isFinished = (task: ITaskOverview): boolean => {
    if (task.FinishDate === null) return false;
    const date = new Date(task.FinishDate);
    return date instanceof Date && date.getTime && !isNaN(date.getTime());
}