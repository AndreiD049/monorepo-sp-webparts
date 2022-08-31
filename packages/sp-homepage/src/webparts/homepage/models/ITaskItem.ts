type TaskType = 'Daily' | 'Weekly' | 'Monthly';

export default interface ITaskItem {
    Id: number;
    Title: string;
    AssignedToId: number;
    Type: TaskType;
    WeeklyDays: string[];
    MonthlyDay: number;
    Time: string;
    DaysDuration: number;
    Transferable: boolean;
    ActiveFrom: string;
    ActiveTo: string;
}
