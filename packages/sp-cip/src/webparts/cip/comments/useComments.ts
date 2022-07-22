import * as React from 'react';
import { useContext, useMemo } from 'react';
import { IndexedDBCacher } from 'sp-indexeddb-caching';
import CipWebPart from '../CipWebPart';
import { ITaskOverview } from '../tasks/ITaskOverview';
import { useTasks } from '../tasks/useTasks';
import { taskUpdated } from '../utils/dom-events';
import { GlobalContext } from '../utils/GlobalContext';
import { ITaskComment } from './ITaskComment';

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

export const useComments = () => {
    const { properties } = useContext(GlobalContext);
    const taskListId = properties.taskListId;
    const { commentAdded } = useTasks();
    const sp = React.useMemo(() => CipWebPart.SPBuilder.getSP('Data'), []);
    const list = sp.web.lists.getByTitle(properties.activitiesListName);

    const getAllRequest = (listId: string) => {
        return list.items
            .filter(`ActivityType eq 'Comment' and ListId eq '${listId}'`)
            .select(...COMMENTS_SELECT);
    };

    const getAll = async (): Promise<ITaskComment[]> => {
        return getAllRequest(taskListId)();
    };

    const addComment = async (task: ITaskOverview, comment: string) => {
        const payload: ITaskComment = {
            ListId: taskListId,
            ItemId: task.Id,
            ActivityType: 'Comment',
            Comment: comment,
        };

        const added = await list.items.add(payload);

        const latest = await commentAdded(task.Id);
        await taskUpdated(latest);

        return added;
    };

    const editComment = async (id: number, content: Partial<ITaskComment>) => {
        return list.items.getById(id).update(content);
    };

    const getByTaskRequest = (
        listId: string,
        taskId: number,
        top?: number,
        skip?: number
    ) => {
        let result = list.items
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

    const getByTask = async (
        task: ITaskOverview,
        top?: number,
        skip?: number
    ): Promise<ITaskComment[]> => {
        const listId = taskListId;
        return getByTaskRequest(listId, task.Id, top, skip)();
    };

    const getByTaskPaged = async (
        task: ITaskOverview,
        pageSize: number
    ): Promise<IPagedCollection<ITaskComment[]>> => {
        return list.items
            .filter(
                `ListId eq '${taskListId}' and ItemId eq ${task.Id} and ActivityType eq 'Comment'`
            )
            .select(...COMMENTS_SELECT)
            .expand(...COMMENTS_EXPAND)
            .orderBy('Created', false)
            .top(pageSize)
            .getPaged<ITaskComment[]>();
    };

    const getCommentRequest = (id: number) => {
        return list.items
            .getById(id)
            .select(...COMMENTS_SELECT)
            .expand(...COMMENTS_EXPAND);
    };

    const getComment = async (id: number): Promise<ITaskComment> => {
        return getCommentRequest(id)();
    };

    return {
        getComment,
        getAll,
        addComment,
        getByTask,
        getByTaskPaged,
        editComment,
    };
};
