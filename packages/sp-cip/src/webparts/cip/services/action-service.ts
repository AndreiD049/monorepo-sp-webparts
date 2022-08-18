import { IItems, IList, SPFI } from 'sp-preset';
import CipWebPart, { ICipWebPartProps } from '../CipWebPart';

export type ActionType =
    | 'Time log'
    | 'Due date'
    | 'Progress'
    | 'Priority'
    | 'Responisble'
    | 'Status'
    | 'Estimated time'
    | 'Created'
    | 'Finished';

export interface IAction {
    Id: number;
    ListId: string;
    ItemId: number;
    ActivityType: ActionType;
    Comment: string;
    Author?: {
        Id: number;
        Title: string;
        EMail: string;
    };
    Editor?: {
        Id: number;
        Title: string;
        EMail: string;
    };
    Created?: string;
    Modified?: string;
}

export const LIST_SELECT = [
    'Id',
    'ListId',
    'ItemId',
    'ActivityType',
    'Comment',
    'Author/Id',
    'Author/Title',
    'Author/EMail',
    'Created',
    'Editor/Id',
    'Editor/Title',
    'Editor/EMail',
    'Modified',
];

export const LIST_EXPAND = ['Author', 'Editor'];

const wrap = (item: IItems) => {
    return item
        .select(...LIST_SELECT)
        .expand(...LIST_EXPAND)
        .orderBy('Created', false)();
};

export class ActionService {
    private sp: SPFI;
    private taskListId: string;
    private list: IList;

    constructor(defaultKey: string, properties: ICipWebPartProps) {
        this.sp = CipWebPart.SPBuilder.getSP(defaultKey);
        this.taskListId = properties.taskListId;
        this.list = this.sp.web.lists.getByTitle(properties.activitiesListName);
    }

    async getAction(id: number): Promise<IAction> {
        return this.list.items
            .getById(id)
            .select(...LIST_SELECT)
            .expand(...LIST_EXPAND)();
    };

    async getActions(taskId: number): Promise<IAction[]> {
        return wrap(
            this.list.items.filter(
                `ListId eq '${this.taskListId}' and ItemId eq ${taskId} and ActivityType ne 'Comment'`
            )
        );
    };

    async addAction(
        taskId: number | null,
        type: ActionType,
        comment?: string
    ) {
        return this.list.items.add({
            ListId: this.taskListId,
            ItemId: taskId,
            ActivityType: type,
            Comment: comment,
        });
    };

    async updateAction(
        id: number,
        body: Partial<IAction>
    ) {
        return this.list.items.getById(id).update(body);
    };
}