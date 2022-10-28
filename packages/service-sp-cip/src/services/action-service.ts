import { IItems, IList, SPFI } from 'sp-preset';
import { IServiceProps } from '../models/IServiceProps';
import { dateODataFormat, getAllPaged } from '../utils';

export type ActionType =
    | 'Time log'
    | 'Due date'
    | 'Progress'
    | 'Priority'
    | 'Responsible'
    | 'Status'
    | 'Estimated time'
    | 'Created'
    | 'Comment'
    | 'Finished';

export interface IAction {
    Id: number;
    ListId: string;
    ItemId: number | null;
    ActivityType: ActionType;
    Comment?: string;
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
    User?: {
        Id: number;
        Title: string;
        EMail: string;
    };
    UserId?: number;
    Date?: string;
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
    'User/Id',
    'User/Title',
    'User/EMail',
    'Date',
];

export const LIST_EXPAND = ['Author', 'Editor', 'User'];

const wrap = (item: IItems) => {
    return item
        .select(...LIST_SELECT)
        .expand(...LIST_EXPAND)
        .orderBy('Created', false);
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
        )();
    };

    async getActionsFromTo(dateFrom: Date, dateTo: Date): Promise<IAction[]> {
        return getAllPaged(wrap(
            this.list.items.filter(`ListId eq '${await this.taskListId}' and Date ge '${dateODataFormat(dateFrom)}' and Date lt '${dateODataFormat(dateTo)}'`)
        ));
    }

    async addAction(
        taskId: number | null,
        type: ActionType,
        comment?: string,
        userId?: number,
        date?: string,
    ) {
        const data: Partial<IAction> ={
            ListId: await this.taskListId,
            ItemId: taskId,
            ActivityType: type,
            Comment: comment,
        } 
        if (userId) data.UserId = userId;
        if (date) data.Date = date;
        return this.list.items.add(data);
    };

    async updateAction(
        id: number,
        body: Partial<IAction>
    ) {
        return this.list.items.getById(id).update(body);
    };
}
