import ITaskLog from '../models/ITaskLog';
import TasksWebPart, { ITasksWebPartProps } from '../TasksWebPart';
import UserService from './users';
import { DateTime } from 'luxon';
import ITask from '../models/ITask';
import { processChangeResult } from '../utils/utils';
import { SPFI, IList, IItemAddResult, IItems } from 'sp-preset';

const LOG_SELECT = [
    'ID',
    'Title',
    'Task/ID',
    'Task/Title',
    'Task/Time',
    'Description',
    'Date',
    'DateTimeStarted',
    'DateTimeFinished',
    'Status',
    'Time',
    'User/ID',
    'User/Title',
    'User/EMail',
    'Remark',
    'OriginalUser/ID',
    'Completed',
    'Transferable'
];

const LOG_EXPAND = ['Task', 'User', 'OriginalUser'];

export default class TaskLogsService {
    userService: UserService;
    rootSP: SPFI;
    sp: SPFI;
    list: IList;
    listName: string;
    lastToken: string;

    constructor(props: ITasksWebPartProps) {
        this.sp = TasksWebPart.SPBuilder.getSP('Data');
        this.rootSP = TasksWebPart.SPBuilder.getSP();
        this.list = this.sp.web.lists.getByTitle(props.taskLogsListTitle);
        this.listName = props.taskLogsListTitle;
        this.userService = new UserService();
        this.lastToken = null;
    }

    /**
     * Get task logs.
     * Possible parameters:
     *  - date: Date - filters on Date of the task log
     *  - user: string | number - if number, should be user's id, if string should be user's title
     * Without any parameters will return all task logs
     */
    async getTaskLogs(): Promise<ITaskLog[]>;
    async getTaskLogs(date: Date): Promise<ITaskLog[]>;
    async getTaskLogs(date: Date, user: number): Promise<ITaskLog[]>;
    async getTaskLogs(date: Date, user: string): Promise<ITaskLog[]>;
    async getTaskLogs(
        date?: Date,
        user?: number | string
    ): Promise<ITaskLog[]> {
        if (date === undefined) {
            date = new Date();
        }
        if (user === undefined) {
            user = (await this.userService.getCurrentUser()).Id;
        }
        if (typeof user === 'string') {
            user = (await this.userService.getUser(user)).Id;
        }
        const filter = `(Date eq '${DateTime.fromJSDate(
            date
        ).toISODate()}') and (UserId eq ${user})`;
        return this._wrap(this.list.items.filter(filter))();
    }

    async getTaskLogsByTaskId(taskId: number, fromDate: Date): Promise<ITaskLog[]> {
        const filter = `TaskId eq ${taskId} and Date ge '${fromDate.toISOString()}'`;
        return this._wrap(this.list.items.filter(filter))();   
    }

    async clearTaskLogsByTaskId(taskId: number, fromDate: Date) {
        const [batchedSP, execute] = this.sp.batched();
        const dt = DateTime.fromJSDate(fromDate).startOf('day');
        const tasklogs = await this.getTaskLogsByTaskId(taskId, dt.toJSDate());
        const list = batchedSP.web.lists.getByTitle(this.listName);
        tasklogs.forEach((log) => {
            list.items.getById(log.ID).delete();
        });
        await execute();
    }

    async getTaskLogsByUserIds(date: Date, userIds: number[]): Promise<ITaskLog[]> {
        let res: ITaskLog[] = [];
        const [batchedSP, execute] = this.sp.batched();
        const dt = DateTime.fromJSDate(date);
        const list = batchedSP.web.lists.getByTitle(this.listName);
        userIds.forEach((userId) => {
            this._wrap(
                list.items.filter(this.getTaskLogFilter(userId, dt))
            )().then((r) => (res = res.concat(r)));
        });
        // Additional query for incomplete tasks
        this._wrap(
            list.items.filter(this.getIncompleteUserTasks(dt))
        )().then((r) => (res = res.concat(r)));

        await execute();
        return res;
    }

    /**
     * Get single task log by id
     */
    async getTaskLog(id: number): Promise<ITaskLog> {
        return this.list.items.getById(id).select(...LOG_SELECT).expand(...LOG_EXPAND)();
    }

    /**
     * Returns whether there are any changes in task logs
     * This is a rather strange method, but as long as it works
     * CAML queries should be used here
     * See: https://docs.microsoft.com/en-us/sharepoint/dev/schema/introduction-to-collaborative-application-markup-language-caml
     */
    async didTaskLogsChanged(date: Date, userIds: number[]): Promise<boolean> {
        const dt = DateTime.fromJSDate(date).toISODate();
        const values = userIds.map(id => `<Value Type='User'>${id}</Value>)`);
        const result = await this.list.getListItemChangesSinceToken({
                RowLimit: '1',
                Query: `<Where>
                    <And>
                        <In>
                            <FieldRef Name='User' LookupId='TRUE'/>
                            <Values>
                                ${values}
                            </Values>
                        </In>
                        <Eq>
                            <FieldRef Name='Date'/>
                            <Value Type='Date'>${dt}</Value>
                        </Eq>
                    </And>
                </Where>`,
                ChangeToken: this.lastToken,
            });
        return processChangeResult(result, this);
    }

    /**
     * Create a new task log from a task.
     * In order to create the task we should know:
     *  - User to which the task is assigned
     *  - Date of the task (default today)
     */
    async createTaskLogs(tasks: ITask[], date: Date) {
        const [batchSP, execute] = this.sp.batched();
        if (date === undefined) {
            date = new Date();
        }

        const res: IItemAddResult[] = [];

        tasks.forEach((task) => {
            batchSP.web.lists
                .getByTitle(this.listName)
                .items.add(this.castTaskToTaskLog(task, date))
                .then((r) => res.push(r));
        });
        await execute();
        return res;
    }

    async createTaskLogFromTask(task: ITask, date?: Date, additionalProps?: Partial<ITaskLog>): Promise<ITaskLog> {
        if (date === undefined) {
            date = new Date();
        }

        const log = this.castTaskToTaskLog(task, date);
        const result = await this.list.items.add({
            ...log,
            ...additionalProps
        });
        return result.item.select(...LOG_SELECT).expand(...LOG_EXPAND)();
    }

    async updateTaskLog(id: number, update: Partial<ITaskLog>): Promise<ITaskLog> {
        return (await this.list.items.getById(id).update(update)).item
            .select(...LOG_SELECT)
            .expand(...LOG_EXPAND)();
    }

    async getTaskLogsFromAddResult(
        results: IItemAddResult[]
    ): Promise<ITaskLog[]> {
        return Promise.all(
            results.map(
                async (res) =>
                    await res.item.select(...LOG_SELECT).expand(...LOG_EXPAND)()
            )
        );
    }

    private castTaskToTaskLog(task: ITask, date: Date): Partial<ITaskLog> {
        const dt = DateTime.fromJSDate(date);
        const time = DateTime.fromISO(task.Time).toUTC();
        const dateString = dt.toISODate();
        const dateTime = DateTime.utc(dt.year, dt.month, dt.day, time.hour, time.minute, 0);
        return {
            Title: task.Title,
            Date: dateString,
            Status: 'Open',
            Time: dateTime.plus({ days: task.DaysDuration }).toISO(),
            TaskId: task.ID,
            UserId: task.AssignedTo.ID,
            UniqueValidation: `${task.ID}-${task.AssignedTo.ID}-${dateString}`,
            Description: task.Description,
            // If task is not transferable, log is set to default completed
            // meaning it will not appear tomorrow if it's not on the list
            Completed: !task.Transferable,
            Transferable: task.Transferable,
            TaskType: task.Type,
        };
    }

    private _wrap(items: IItems) {
        return items
            .orderBy('Task/Time', true)
            .select(...LOG_SELECT)
            .expand(...LOG_EXPAND);
    }

    /**
     * 
     * @param userId 
     * @param dt currently selected date
     * @returns the filter to be applied on the list of task logs
     */
    private getTaskLogFilter(userId: number, dt: DateTime) {
        return `(Date eq '${dt.toISODate()}') and ((UserId eq ${userId}) or (OriginalUserId eq ${userId}))`;
    }

    /**
     * Get incomplete tasks for all users (normally there shouldn't be too many)
     * @param dt upper date for incomplete tasks filter
     * @returns 
     */
    private getIncompleteUserTasks(dt: DateTime) {
        return `(Completed eq false) and (Date le '${dt.toISODate()}')`;
    }
}
