import { create } from 'lodash';
import { DateTime } from 'luxon';
import { SPFI, IList, IItems, Caching, getHashCode } from 'sp-preset';
import ITask from '../models/ITask';
import TasksWebPart, { ITasksWebPartProps } from '../TasksWebPart';
import { processChangeResult } from '../utils/utils';
import UserService from './users';

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

class TaskService {
    userService: UserService;
    sp: SPFI;
    list: IList;
    listTitle: string;
    lastToken: string;
    private id: string = 'TASKS';


    constructor(public props: ITasksWebPartProps) {
        this.sp = TasksWebPart.SPBuilder.getSP('Data');
        this.list = this.sp.web.lists.getByTitle(props.tasksListTitle);
        this.listTitle = props.tasksListTitle;
        this.userService = new UserService();
        this.lastToken = null;
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

    async getTasksByOriginalId(originalId): Promise<ITask[]> {
        return this._wrap(this.list.items
            .filter(`ID eq ${originalId} or OriginalTaskId eq ${originalId}`))();
    }

    async createTask(createdTask: Partial<ITask>) {
        return this.list.items.add({
            Title: createdTask.Title,
            Description: createdTask.Description,
            AssignedToId: createdTask.AssignedTo.ID,
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

    /**
     * Update task.
     * Return just the result of update, if user will need the updated task
     */
    async updateTask(taskId: number, update: Partial<ITask>) {
        var result = this.list.items.getById(taskId).update(update);
        return result;
    }

    async deleteTask(taskId) {
        return this.list.items.getById(taskId).delete();
    }

    /**
     * This is a rather strange method, but as long as it works
     * CAML queries should be used here
     * See: https://docs.microsoft.com/en-us/sharepoint/dev/schema/introduction-to-collaborative-application-markup-language-caml
     */
    async didTasksChanged(userIds: number[]): Promise<boolean> {
        const values = userIds.map(id => `<Value Type='User'>${id}</Value>`).join();
        const result = await this.list.getListItemChangesSinceToken({
            RowLimit: '1',
            Query: 
            `<Where>
                <In>
                    <FieldRef Name='AssignedTo' LookupId='TRUE'/>
                    <Values>
                        ${values}
                    </Values>
                </In>
            </Where>`,
            ChangeToken: this.lastToken,
        });
        return processChangeResult(result, this);
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

    async getTasksByUserTitle(userTitle: string) {
        const user = await this.userService.getUser(userTitle);
        return this.getTasksByUserId(user.Id);
    }

    private _wrap(items: IItems) {
        return items
            .orderBy('Time', true)
            .select(...TASK_SELECT)
            .expand(...TASK_EXPAND);
    }
}

export default TaskService;
