import * as React from 'react';
import { useContext, useMemo } from 'react';
import { IndexedDBCacher } from 'sp-indexeddb-caching';
import CipWebPart from '../CipWebPart';
import { ITaskOverview } from '../tasks/ITaskOverview';
import { GlobalContext } from '../utils/GlobalContext';
import { ITaskComment } from './ITaskComment';

const COMMENTS_SELECT = ['Id', 'ListId', 'ItemId', 'Comment', 'ActivityType', 'Created', 'Author/Title'];
const COMMENTS_EXPAND = ['Author'];

export const useComments = () => {
    const { properties } = useContext(GlobalContext);
    const { Cache, CachingTimeline } = IndexedDBCacher();
    const sp = React.useMemo(
        () => CipWebPart.SPBuilder.getSP('Data').using(CachingTimeline),
        []
    );
    const longCachedSP = useMemo(
        () =>
            CipWebPart.SPBuilder.getSP('Data').using(
                IndexedDBCacher({
                    expireFunction: () =>
                        new Date(Date.now() + 1000 * 60 * 60 * 24),
                }).CachingTimeline
            ),
        []
    );
    const list = sp.web.lists.getByTitle(properties.activitiesListName);
    const taskList = longCachedSP.web.lists.getByTitle(
        properties.tasksListName
    );

    React.useEffect(() => {}, []);

    const getListId = async () => {
        return (await taskList.select('Id')()).Id;
    };

    const getAllRequest = (listId: string) => {
        return list.items
            .filter(`ActivityType eq 'Comment' and ListId eq '${listId}'`)
            .select(...COMMENTS_SELECT);
    };

    const getAll = async (): Promise<ITaskComment[]> => {
        const listId = await getListId();
        return getAllRequest(listId)();
    };

    const addComment = async (task: ITaskOverview, comment: string) => {
        const listId = await getListId();
        const payload: ITaskComment = {
            ListId: listId,
            ItemId: task.Id,
            ActivityType: 'Comment',
            Comment: comment,
        };
        const added = await list.items.add(payload);
        await onCommentAdded(added.data.Id);
        return added;
    };

    const getByTaskRequest = (listId: string, taskId: number, top?: number, skip?: number) => {
        let result = list.items
            .filter(`ListId eq '${listId}' and ItemId eq ${taskId}`)
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

    const getByTask = async (task: ITaskOverview, top?: number, skip?: number): Promise<ITaskComment[]> => {
        const listId = await getListId();
        return getByTaskRequest(listId, task.Id, top, skip)();
    };

    const getCommentRequest = (id: number) => {
        return list.items.getById(id)
            .select(...COMMENTS_SELECT)
            .expand(...COMMENTS_EXPAND);
    };
    const getComment = async (id: number): Promise<ITaskComment> => {
        return getCommentRequest(id)();
    }

    /**
     * Adjust cached when a comment is added
     */
    const onCommentAdded = async (id: number) => {
        await Cache.get(getCommentRequest(id).toRequestUrl()).remove();
        const comment = await getComment(id);
        await Cache.get(getAllRequest(comment.ListId).toRequestUrl()).set(
            (prev: ITaskComment[]) => [comment, ...prev]
        );
        await Cache.get(
            getByTaskRequest(comment.ListId, comment.ItemId).toRequestUrl()
        ).set((prev: ITaskComment[]) => [comment, ...prev]);
        await Cache.get(
            getByTaskRequest(comment.ListId, comment.ItemId, 3, 0).toRequestUrl()
        ).set((prev: ITaskComment[]) => [comment, ...prev.slice(0, 2)]);
    };


    return { getComment, getAll, addComment, getByTask };
};
