import SPBuilder, { IList, SPFI } from 'sp-preset';
import { ICreateTask } from '../models/ICreateTask';
import { IServiceProps } from '../models/IServiceProps';
import { ITaskOverview, LIST_EXPAND, LIST_SELECT } from '../models/ITaskOverview';
import { isFinished } from '../utils';

/**
 * Tasks service
 */
export class TaskService {
    private sp: SPFI;
    private list: IList;

    constructor(props: IServiceProps) {
        this.sp = props.sp;
        this.list = this.sp.web.lists.getByTitle(props.listName);
    }

    async getTaskListId() {
        return (await this.list.select('Id')()).Id;
    };

    getAllRequest() {
        return this.list.items.select(...LIST_SELECT).expand(...LIST_EXPAND);
    };

    async getAll(): Promise<ITaskOverview[]> {
        return this.getAllRequest()();
    };

    async getAllCategories(): Promise<string[]> {
        const all = await this.list.items.select('Category')();
        return Array.from(new Set(all.map((i) => i.Category).filter((c) => c !== 'NA')));
    }

    async getUserTasks(
        userId: number,
        status: 'Open' | 'Finished' | 'All'
    ): Promise<ITaskOverview[]> {
        let filter = `ResponsibleId eq ${userId}`;
        // Handle status
        switch (status) {
            case 'Finished':
                filter += ` and FinishDate ne null`;
                break;
            case 'Open':
                filter += ` and FinishDate eq null`;
                break;
        }
        return this.list.items
            .filter(filter)
            .select(...LIST_SELECT)
            .expand(...LIST_EXPAND)();
    };

    getTaskRequest(id: number) {
        return this.list.items
            .getById(id)
            .select(...LIST_SELECT)
            .expand(...LIST_EXPAND);
    };

    async getTask(id: number): Promise<ITaskOverview> {
        return this.getTaskRequest(id)();
    };

    getMainsRequest(filter: string) {
        return this.list.items
            .filter(filter)
            .select(...LIST_SELECT)
            .expand(...LIST_EXPAND);
    };

    async getNonFinishedMains(): Promise<ITaskOverview[]> {
        return this.getMainsRequest(`FinishDate eq null and Parent eq null`)();
    };

    async getFinishedMains(): Promise<ITaskOverview[]> {
        return this.getMainsRequest(`FinishDate ne null and Parent eq null`)();
    };

    async getAllMains(): Promise<ITaskOverview[]> {
        return this.getMainsRequest(`Parent eq null`)();
    };

    getSubtasksRequest(id: number) {
        return this.list.items
            .filter(`ParentId eq ${id}`)
            .select(...LIST_SELECT)
            .expand(...LIST_EXPAND);
    };

    async deleteTaskAndSubtasks(task: ITaskOverview) {
        // All subtasks should be deleted because of this.list field setup (DeleteBehavior Cascade)
        await this.list.items.getById(task.Id).delete();
    };

    async getSubtasks(
        parent: ITaskOverview
    ): Promise<ITaskOverview[]> {
        let subtasks = await this.getSubtasksRequest(parent.Id)();
        // Guard if we have wrong number of subtasks
        if (subtasks.length !== parent.Subtasks) {
            await this.updateTask(parent.Id, {
                Subtasks: subtasks.length,
            });
        }
        return subtasks;
    };

    async createTask(details: ICreateTask) {
        const payload: ICreateTask = {
            ...details,
            EffectiveTime: 0,
            Status: 'New',
            Progress: 0,
        };
        const created = await this.list.items.add(payload);
        await created.item.update({
            MainTaskId: created.data.Id,
        });
        return created.data.Id;
    };

    async createSubtask(
        details: ICreateTask,
        parent: ITaskOverview
    ) {
        const payload: ICreateTask = {
            ...details,
            EffectiveTime: 0,
            Status: 'New',
            Progress: 0,
            ParentId: parent.Id,
            MainTaskId: parent.MainTaskId,
        };
        const added = await this.list.items.add(payload);
        const subtasks = await this.getSubtasks(parent);
        await this.updateTask(parent.Id, {
            Subtasks: subtasks.length,
        });
        return added.data.Id;
    };

    async updateTask(
        id: number,
        details: Partial<ITaskOverview & { ResponsibleId: number }>
    ) {
        await this.list.items.getById(id).update(details);
    };

    /**
     * @param taskId id of the task where comment was added
     * @returns the latest version of the task
     */
    async commentAdded(taskId: number) {
        const latest = await this.getTask(taskId);
        if (!latest.CommentsCount) {
            latest.CommentsCount = 0;
        }
        latest.CommentsCount += 1;
        await this.updateTask(taskId, {
            CommentsCount: latest.CommentsCount,
        });
        return latest;
    };

    /**
     * @param taskId task to be updated
     * @param attachments How many attachments were adde/removed (can be newgative)
     * @returns the latest attachment
     */
    async attachmentsUpdated(taskId: number, attachments: number) {
        const latest = await this.getTask(taskId);
        if (!latest.AttachmentsCount) {
            latest.AttachmentsCount = 0;
        }
        latest.AttachmentsCount = Math.max(
            latest.AttachmentsCount + attachments,
            0
        );
        await this.updateTask(taskId, {
            AttachmentsCount: latest.AttachmentsCount,
        });
        return latest;
    };

    async finishTask(id: number) {
        const item = await this.getTask(id);
        // Already finished
        if (isFinished(item)) return;
        await this.updateTask(id, {
            FinishDate: new Date().toISOString(),
            Status: 'Finished',
            Progress: 1,
        });
        // Check if we need to remove subtask from parent
        if (item.ParentId) {
            const parent = await this.getTask(item.ParentId);
            const subtasks = await this.getSubtasks(parent);
            await this.updateTask(item.ParentId, {
                Subtasks: subtasks.length,
                FinishedSubtasks: subtasks.filter((s) => isFinished(s)).length,
            });
        }
    };

    async reopenTask(id: number) {
        const item = await this.getTask(id);
        // Not finished
        if (!isFinished(item)) return;
        await this.updateTask(id, {
            FinishDate: null,
            Status: 'In-Progress',
        });
        if (item.ParentId) {
            const parent = await this.getTask(item.ParentId);
            const subtasks = await this.getSubtasks(parent);
            await this.updateTask(item.ParentId, {
                Subtasks: subtasks.length,
                FinishedSubtasks: subtasks.filter((s) => isFinished(s)).length,
            });
        }
    };

}