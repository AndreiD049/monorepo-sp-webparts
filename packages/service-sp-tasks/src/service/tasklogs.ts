import ITaskLog from '../models/ITaskLog';
import { DateTime } from 'luxon';
import ITask from '../models/ITask';
import { SPFI, IList, IItemAddResult, IItems } from 'sp-preset';

const LOG_SELECT = [
    'ID',
    'Title',
    'Task/ID',
    'Task/Title',
    'Task/Time',
    'Task/Category',
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

export interface ITaskLogsProps {
    sp: SPFI;
    listName: string;
}

export class TaskLogsService {
    sp: SPFI;
    list: IList;
    listName: string;

    constructor(props: ITaskLogsProps) {
        this.sp = props.sp;
        this.list = this.sp.web.lists.getByTitle(props.listName);
        this.listName = props.listName;
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
            list.items.filter(this.getIncompleteTasks(dt))
        )().then((r) => (res = res.concat(r)));

        await execute();
        return res;
    }

    async getTaskLogsByUserId(date: Date, userId: number): Promise<ITaskLog[]> {
        const dt = DateTime.fromJSDate(date);
        let res: ITaskLog[] = await this._wrap(
            this.list.items.filter(this.getIncompleteUserTasks(userId, dt))
        )();
        return this._wrap(
            this.list.items.filter(this.getTaskLogFilter(userId, dt))
        )().then((r) => (res = res.concat(r)));
    }

    /**
     * Get single task log by id
     */
    async getTaskLog(id: number): Promise<ITaskLog> {
        return this.list.items.getById(id).select(...LOG_SELECT).expand(...LOG_EXPAND)();
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

        let res: IItemAddResult[] = [];

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
            Completed: !Boolean(task.Transferable),
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
    private getIncompleteTasks(dt: DateTime) {
        return `(Completed eq false) and (Date le '${dt.toISODate()}')`;
    }

    private getIncompleteUserTasks(userId: number, dt: DateTime) {
        return `(Completed eq false) and (UserId eq ${userId}) and (Date lt '${dt.toISODate()}')`;
    }
}
