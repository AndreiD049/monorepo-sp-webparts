import * as React from 'react';
import { IItems } from 'sp-preset';
import CipWebPart from '../CipWebPart';
import { GlobalContext } from '../utils/GlobalContext';

export type ActionType = 'Time log' | 'Due date' | 'Progress' | 'Priority' | 'Responisble' | 'Status' | 'Estimated time' | 'Created' | 'Finished';

export interface IAction {
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

export const useActions = () => {
    const sp = React.useMemo(() => CipWebPart.SPBuilder.getSP('Data'), []);
    const { properties } = React.useContext(GlobalContext);
    const taskListId = properties.taskListId;
    const list = sp.web.lists.getByTitle(properties.activitiesListName);

    const getActions = async (taskId: number): Promise<IAction[]> => {
        return wrap(
            list.items.filter(
                `ListId eq '${taskListId}' and ItemId eq ${taskId} and ActivityType ne 'Comment'`
            )
        );
    };

    const addAction = async (
        taskId: number,
        type: ActionType,
        comment?: string
    ) => {
        return list.items.add({
            ListId: taskListId,
            ItemId: taskId,
            ActivityType: type,
            Comment: comment,
        });
    };

    return {
        getActions,
        addAction,
    };
};
