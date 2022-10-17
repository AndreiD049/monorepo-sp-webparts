import { DateTime } from 'luxon';
import { SPFI, IList, IItems } from 'sp-preset';
import ITask from '../models/ITask';

const TASK_SELECT = [
    'ID',
    'Title',
    'Description',
    'AssignedTo/ID',
    'AssignedTo/Title',
    'AssignedTo/EMail',
    'Time',
    'DaysDuration',
    'Type',
    'WeeklyDays',
    'MonthlyDay',
    'Transferable',
    'ActiveFrom',
    'ActiveTo',
    'OriginalTaskId',
];

const TASK_EXPAND = ['AssignedTo'];

export interface ITaskServiceProps {
    sp: SPFI;
    listName: string;
}

export class TaskService {
    private sp: SPFI;
    private list: IList;
    private listTitle: string;


    constructor(public props: ITaskServiceProps) {
        this.sp = props.sp;
        this.list = this.sp.web.lists.getByTitle(props.listName);
        this.listTitle = props.listName;
    }

    async getTasks() {
        return this.list.items.select(...TASK_SELECT).expand(...TASK_EXPAND)();
    }

    async getTask(id: number): Promise<ITask> {
        return this.sp.web.lists.getByTitle(this.listTitle).items.getById(id).select(...TASK_SELECT).expand(...TASK_EXPAND)();
    }

    async getTasksByUserId(userId: number) {
        return this._wrap(this.list.items
            .filter(`AssignedToId eq ${userId}`))();
    }

    async getTasksByOriginalId(originalId: number): Promise<ITask[]> {
        return this._wrap(this.list.items
            .filter(`ID eq ${originalId} or OriginalTaskId eq ${originalId}`))();
    }

    async createTask(createdTask: Partial<ITask>) {
        return this.list.items.add({
            Title: createdTask.Title,
            Description: createdTask.Description,
            AssignedToId: createdTask.AssignedTo?.ID,
            Type: createdTask.Type,
            MonthlyDay: createdTask.MonthlyDay,
            WeeklyDays: createdTask.WeeklyDays || [],
            Transferable: createdTask.Transferable,
            DaysDuration: createdTask.DaysDuration,
            Time: createdTask.Time,
            ActiveFrom: createdTask.ActiveFrom,
            ActiveTo: createdTask.ActiveTo,
            OriginalTaskId: createdTask.OriginalTaskId
        });
    }

    async createTasks(tasks: (Partial<ITask & { AssignedToId: number }>)[]) {
        const [batchedSP, execute] = this.sp.batched();
        const batchedList = batchedSP.web.lists.getByTitle(this.listTitle);
        tasks.forEach((task) => batchedList.items.add(task));
        await execute();
    }

    /**
     * Update task.
     * Return just the result of update, if user will need the updated task
     */
    async updateTask(taskId: number, update: Partial<ITask>) {
        var result = this.list.items.getById(taskId).update(update);
        return result;
    }

    async deleteTask(taskId: number) {
        return this.list.items.getById(taskId).delete();
    }

    async getTasksByMultipleUserIds(userIds: number[], date: Date) {
        const isoDate = DateTime.fromJSDate(date).toISODate();
        let res: ITask[] = [];
        const [batchedSP, execute] = this.sp.batched();
        const list = batchedSP.web.lists.getByTitle(this.listTitle);
        userIds.forEach((id) => this._wrap(list.items
            .filter(`AssignedToId eq ${id} and ActiveFrom le '${isoDate}' and ActiveTo ge '${isoDate}'`))()
            .then(r => res = res.concat(r)));
        await execute();
        return res;
    }

    private _wrap(items: IItems) {
        return items
            .orderBy('Time', true)
            .select(...TASK_SELECT)
            .expand(...TASK_EXPAND);
    }
}
