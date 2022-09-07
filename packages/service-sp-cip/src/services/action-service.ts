import { IItems, IList, SPFI } from 'sp-preset';
import { IServiceProps } from '../models/IServiceProps';

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

export interface IActionServiceProps extends IServiceProps {
    taskListName: string;
}

export class ActionService {
    private sp: SPFI;
    private taskListId: Promise<string>;
    private list: IList;

    constructor(props: IActionServiceProps) {
        this.sp = props.sp;
        this.taskListId = this.sp.web.lists.getByTitle(props.taskListName).select('Id')().then((l) => l.Id.toString());
        this.list = this.sp.web.lists.getByTitle(props.listName);
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
                `ListId eq '${await this.taskListId}' and ItemId eq ${taskId} and ActivityType ne 'Comment'`
            )
        );
    };

    async addAction(
        taskId: number | null,
        type: ActionType,
        comment?: string
    ) {
        return this.list.items.add({
            ListId: await this.taskListId,
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