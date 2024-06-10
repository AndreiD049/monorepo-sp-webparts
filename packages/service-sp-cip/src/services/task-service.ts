import { IList, SPFI } from 'sp-preset';
import { ICreateTask } from '../models/ICreateTask';
import { IServiceProps } from '../models/IServiceProps';
import {
    ITaskOverview,
	ITaskNoteView,
    LIST_EXPAND,
    LIST_SELECT,
    ITaskTimingView,
    ITaskTimingDict,
} from '../models/ITaskOverview';
import { getAllPaged, isFinished, statusToFilter } from '../utils';

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
    }

    private teamFilter(team: string) {
        return `Team eq '${team}'`;
    }

    getAllRequest(filter?: string) {
        let request = this.list.items;
		if (filter) {
			request = request.filter(filter);
		}
        return request.select(...LIST_SELECT).expand(...LIST_EXPAND).orderBy('Created', false)
    }

    async getAll(team?: string, status?: 'Open' | 'Finished' | 'All'): Promise<ITaskOverview[]> {
		let statusFilter: string[] = [];
		if (team) {
			statusFilter.push(this.teamFilter(team));
		}
		if (status) {
			const s = statusToFilter(status);
			if (s !== '') {
				statusFilter.push(s);
			}
		}
        return getAllPaged(this.getAllRequest(statusFilter.join(' and ')));
    }

    async getAllOpenByCategory(category?: string): Promise<ITaskOverview[]> {
        return getAllPaged(
            this.list.items
                .filter(`Category eq '${category}' and FinishDate eq null`)
                .select(...LIST_SELECT)
                .expand(...LIST_EXPAND)
        );
    }

    /**
     * @deprecated this API retrieves only first 100 items. If there are more than 100 items,
     * some categories might be missing. Instead, use getCategories and addCategory
     */
    async getAllCategories(): Promise<string[]> {
        const all = await this.list.items.select('Category')();
        return Array.from(
            new Set(all.map((i) => i.Category).filter((c) => c !== 'NA'))
        );
    }

    async getCategories(): Promise<string[]> {
        const field = await this.list.fields.getByTitle('Category')();
        return field.Choices || [];
    }

    async addCategory(item: string): Promise<void> {
        const field = this.list.fields.getByTitle('Category');
        const choices = (await field()).Choices || [];
        if (choices.indexOf(item) === -1) {
            await field.update({
                Choices: [...choices, item],
            });
        }
    }

    async getUserTasks(
        userId: number,
        status: 'Open' | 'Finished' | 'All',
        team?: string
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
        if (team) {
            filter += ` and ${this.teamFilter(team)}`;
        }
        return getAllPaged(
            this.list.items
                .filter(filter)
                .select(...LIST_SELECT)
                .expand(...LIST_EXPAND)
        );
    }

    getTaskRequest(id: number) {
        return this.list.items
            .getById(id)
            .select(...LIST_SELECT)
            .expand(...LIST_EXPAND);
    }

    async getTask(id: number): Promise<ITaskOverview> {
        return this.getTaskRequest(id)();
    }

	/*
    getMainsRequest(filter: string) {
        return this.list.items
            .filter(filter)
            .select(...LIST_SELECT)
            .expand(...LIST_EXPAND);
    }

    async getNonFinishedMains(team?: string): Promise<ITaskOverview[]> {
        let filter = `FinishDate eq null and Parent eq null`;
        if (team) {
            filter += ` and ${this.teamFilter(team)}`;
        }
        return getAllPaged(this.getMainsRequest(filter));
    }

    async getFinishedMains(team?: string): Promise<ITaskOverview[]> {
        let filter = `FinishDate ne null and Parent eq null`;
        if (team) {
            filter += ` and ${this.teamFilter(team)}`;
        }
        return getAllPaged(this.getMainsRequest(filter));
    }

    async getAllMains(team?: string): Promise<ITaskOverview[]> {
        let filter = `Parent eq null`;
        if (team) {
            filter += ` and ${this.teamFilter(team)}`;
        }
        return getAllPaged(this.getMainsRequest(filter));
    }

	*/

    getSubtasksRequest(id: number, team?: string) {
        let filter = `ParentId eq ${id}`;
        if (team) {
            filter += ` and ${this.teamFilter(team)}`;
        }
        return this.list.items
            .filter(filter)
            .select(...LIST_SELECT)
            .expand(...LIST_EXPAND);
    }

    async getSubtasks(
        parent: ITaskOverview,
        team?: string
    ): Promise<ITaskOverview[]> {
        let subtasks = await getAllPaged<ITaskOverview[]>(
            this.getSubtasksRequest(parent.Id)
        );
        // Guard if we have wrong number of subtasks
        if (subtasks.length !== parent.Subtasks) {
            await this.updateTask(parent.Id, {
                Subtasks: subtasks.length,
            });
        }
        return subtasks;
    }

	async recalculateSubtasks(parentId: number): Promise<ITaskOverview> {
        let subtasks = await getAllPaged<ITaskOverview[]>(
            this.getSubtasksRequest(parentId)
        );
		let parent = await this.getTask(parentId);

		const updatePayload: Partial<ITaskOverview> = {};
		if (parent.Subtasks !== subtasks.length) {
			updatePayload['Subtasks'] = subtasks.length;
		}

		const finished = subtasks.filter(isFinished);
		if (parent.FinishedSubtasks !== finished.length) {
			updatePayload['FinishedSubtasks'] = finished.length;
		}
		
		if (Object.keys(updatePayload).length > 0) {
			await this.updateTask(parent.Id, updatePayload);
			parent = {
				...parent,
				...updatePayload,
			};
		}
		return parent;
	}

    async deleteTaskAndSubtasks(task: ITaskOverview) {
        // All subtasks should be deleted because of this.list field setup (DeleteBehavior Cascade)
        await this.list.items.getById(task.Id).delete();
    }

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
    }

    async createSubtask(details: ICreateTask, parent: ITaskOverview) {
        const payload: ICreateTask = {
            ...details,
            EffectiveTime: 0,
            Status: 'New',
            Progress: 0,
            ParentId: parent.Id,
            MainTaskId: parent.MainTaskId,
        };
        const added = await this.list.items.add(payload);
        await this.getSubtasks(parent);
        return added.data.Id;
    }

    async updateTask(
        id: number,
        details: Partial<ITaskOverview & { ResponsibleId: number }>
    ) {
        await this.list.items.getById(id).update(details);
    }

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
    }

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
    }

    async finishTask(id: number, status: string = 'Finished') {
        const item = await this.getTask(id);
        // Already finished
        if (isFinished(item)) return;
        await this.updateTask(id, {
            FinishDate: new Date().toISOString(),
            Status: status,
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
    }

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
    }


	// Task timings
	// ------------
	async getTaskTimingInfo(): Promise<ITaskTimingDict> {
		const q = this.list.items;
		const tasks: ITaskTimingView[] = await getAllPaged(q.filter('ParentId ne null').select('Id', 'ParentId', 'EstimatedTime', 'EffectiveTime'));
		const result: ITaskTimingDict = {};
		
		// Pass 1: Calculate totals of direct children
		tasks.forEach(t => {
			if (!result[t.ParentId]) {
				result[t.ParentId] = {
					Ids: [],
					EstimatedTime: 0,
					EffectiveTime: 0,
				};
			}
			result[t.ParentId].EstimatedTime += t.EstimatedTime;
			result[t.ParentId].EffectiveTime += t.EffectiveTime;
			result[t.ParentId].Ids.push(t.Id);
		});

		// Pass 2: Add totals of subtasks
		for (const id in result) {
			const total = {
				EstimatedTime: 0,
				EffectiveTime: 0,
			};
			const parent = result[id];
			const idStack = [...parent.Ids];
			while (idStack.length > 0) {
				const childId = idStack.pop();
				if (childId && result[childId]) {
					idStack.push(...result[childId].Ids);
					total.EstimatedTime += result[childId].EstimatedTime;
					total.EffectiveTime += result[childId].EffectiveTime;
				}
			}
			parent.EstimatedTime += total.EstimatedTime;
			parent.EffectiveTime += total.EffectiveTime;
		}
		return result;
	}

	// Notes
	// ------------
	async getNoteSectionName(id: number) {
		const q = this.list.items.getById(id);
		const item: ITaskNoteView = await q.select('Title, NoteSectionName')();
		if (!item.NoteSectionName) {
			const NoteSectionName = id.toString() + ' - ' + item.Title;
			await q.update({ NoteSectionName });
			return NoteSectionName;
		}
		return item.NoteSectionName;
	}
}
