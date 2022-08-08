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
];

const TASK_EXPAND = ['AssignedTo'];

class TaskService {
    userService: UserService;
    sp: SPFI;
    spNoCache: SPFI;
    list: IList;
    listTitle: string;
    lastToken: string;
    private id: string = 'TASKS';


    constructor(public props: ITasksWebPartProps) {
        this.sp = TasksWebPart.SPBuilder.getSP('Data').using(Caching({
            keyFactory: (url) => this.id + getHashCode(url),
        }));
        this.spNoCache = TasksWebPart.SPBuilder.getSP('Data');
        this.list = this.sp.web.lists.getByTitle(props.tasksListTitle);
        this.listTitle = props.tasksListTitle;
        this.userService = new UserService();
        this.lastToken = null;
    }

    async getTasks() {
        return this.list.items.select(...TASK_SELECT).expand(...TASK_EXPAND)();
    }

    async getTask(id: number): Promise<ITask> {
        return this.spNoCache.web.lists.getByTitle(this.listTitle).items.getById(id).select(...TASK_SELECT).expand(...TASK_EXPAND)();
    }

    async getTasksByUserId(userId: number) {
        return this._wrap(this.list.items
            .filter(`AssignedToId eq ${userId}`))();
    }

    /**
     * Update task.
     * Return just the result of update, if user will need the updated task
     */
    async updateTask(taskId: number, update: Partial<ITask>) {
        var result = this.list.items.getById(taskId).update(update);
        this.clearCache();
        return result;
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

    async getTasksByMultipleUserIds(userIds: number[]) {
        let res: ITask[] = [];
        const [batchedSP, execute] = this.sp.batched();
        const list = batchedSP.web.lists.getByTitle(this.listTitle);
        userIds.forEach((id) => this._wrap(list.items
            .filter(`AssignedToId eq ${id}`))()
            .then(r => res = res.concat(r)));
        await execute();
        return res;
    }

    async getTasksByUserTitle(userTitle: string) {
        const user = await this.userService.getUser(userTitle);
        return this.getTasksByUserId(user.Id);
    }

    /**
     * Clears the cached items
     */
    clearCache() {
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith(this.id)) {
                localStorage.removeItem(key);
            }
        }
    }

    private _wrap(items: IItems) {
        return items
            .orderBy('Time', true)
            .select(...TASK_SELECT)
            .expand(...TASK_EXPAND);
    }
}

export default TaskService;
