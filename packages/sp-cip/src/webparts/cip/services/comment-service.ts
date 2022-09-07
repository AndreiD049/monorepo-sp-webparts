import CipWebPart, { ICipWebPartProps } from '../CipWebPart';
import { taskUpdated } from '../utils/dom-events';
import { ITaskComment } from '../comments/ITaskComment';
import MainService from './main-service';
import { IList, SPFI } from 'sp-preset';
import { TaskService } from '@service/sp-cip';
import { ITaskOverview } from '@service/sp-cip/dist/models/ITaskOverview';

const COMMENTS_SELECT = [
    'Id',
    'ListId',
    'ItemId',
    'Comment',
    'ActivityType',
    'Created',
    'Author/Title',
    'Author/EMail',
    'Author/Id',
];
const COMMENTS_EXPAND = ['Author'];

export interface IPagedCollection<T> {
    hasNext: boolean;
    getNext: () => Promise<IPagedCollection<T | null>>;
    results: T;
}

export class CommentService {
    private taskListId: string;
    private taskService: TaskService;
    private sp: SPFI;
    private list: IList;

    constructor(key: string, properties: ICipWebPartProps) {
        this.taskListId = properties.taskListId;
        this.taskService = MainService.getTaskService();
        this.sp = CipWebPart.SPBuilder.getSP(key);
        this.list = this.sp.web.lists.getByTitle(properties.config.commentListName);
    }

    getAllRequest = (listId: string) => {
        return this.list.items
            .filter(`ActivityType eq 'Comment' and ListId eq '${listId}'`)
            .select(...COMMENTS_SELECT);
    };

    async getAll(): Promise<ITaskComment[]> {
        return this.getAllRequest(this.taskListId)();
    };

    async addComment(task: ITaskOverview, comment: string) {
        const payload: ITaskComment = {
            ListId: this.taskListId,
            ItemId: task.Id,
            ActivityType: 'Comment',
            Comment: comment,
        };

        const added = await this.list.items.add(payload);

        await this.taskService.commentAdded(task.Id);

        return added;
    };

    async editComment(id: number, content: Partial<ITaskComment>) {
        return this.list.items.getById(id).update(content);
    };

    getByTaskRequest = (
        listId: string,
        taskId: number,
        top?: number,
        skip?: number
    ) => {
        let result = this.list.items
            .filter(
                `ListId eq '${listId}' and ItemId eq ${taskId} and ActivityType eq 'Comment'`
            )
            .select(...COMMENTS_SELECT)
            .expand(...COMMENTS_EXPAND)
            .orderBy('Created', false);
        if (top) {
            result = result.top(top);
        }
        if (skip) {
            result = result.skip(skip);
        }
        return result;
    };

    async getByTask(
        task: ITaskOverview,
        top?: number,
        skip?: number
    ): Promise<ITaskComment[]> {
        const listId = this.taskListId;
        return this.getByTaskRequest(listId, task.Id, top, skip)();
    };

    async getByTaskPaged(
        task: ITaskOverview,
        pageSize: number
    ): Promise<IPagedCollection<ITaskComment[]>> {
        return this.list.items
            .filter(
                `ListId eq '${this.taskListId}' and ItemId eq ${task.Id} and ActivityType eq 'Comment'`
            )
            .select(...COMMENTS_SELECT)
            .expand(...COMMENTS_EXPAND)
            .orderBy('Created', false)
            .top(pageSize)
            .getPaged<ITaskComment[]>();
    };

    getCommentRequest(id: number) {
        return this.list.items
            .getById(id)
            .select(...COMMENTS_SELECT)
            .expand(...COMMENTS_EXPAND);
    };

    async getComment(id: number): Promise<ITaskComment> {
        return this.getCommentRequest(id)();
    };
}