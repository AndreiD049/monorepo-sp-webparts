/* eslint-disable @rushstack/security/no-unsafe-regexp */
import { TaskService } from "@service/sp-cip";
import { ITaskOverview } from "@service/sp-cip/dist/models/ITaskOverview";
import { ICacheProxyOptions, removeCached, updateCached } from "idb-proxy";
import { DB_NAME, HOUR, MINUTE, STORE_NAME } from "../utils/constants";
import { UserService } from "./user-service";

export const userServiceProxyOptions: (remote: string) => ICacheProxyOptions<UserService> = (remote) => ({
    dbName: DB_NAME,
    storeName: STORE_NAME,
    prefix: `${remote}/UserService`,
    props: {
        getAll: {
            isCached: true,
            expiresIn: HOUR,
        },
        getCurrentUser: {
            isCached: true,
            expiresIn: HOUR,
        },
        getCustomListUsers: {
            isCached: true,
            expiresIn: HOUR,
        },
        getTeams: {
            isCached: true,
            expiresIn: HOUR,
        },
        getUser: {
            isCached: true,
            expiresIn: HOUR,
        }
    }
});

export const taskServiceProxyOptions: (remote: string) => ICacheProxyOptions<TaskService> = (remote) => ({
    dbName: DB_NAME,
    storeName: STORE_NAME,
    prefix: `${remote}/TaskService`,
    props: {
        getAll: {
            isCached: true,
            expiresIn: 8 * HOUR,
        },
        getAllMains: {
            isCached: true,
            expiresIn: 10 * MINUTE,
        },
        getAllOpenByCategory: {
            isCached: true,
            expiresIn: 10 * MINUTE,
        },
        getCategories: {
            isCached: true,
            expiresIn: HOUR,
        },
        getFinishedMains: {
            isCached: true,
            expiresIn: HOUR,
        },
        getNonFinishedMains: {
            isCached: true,
            expiresIn: HOUR,
        },
        getSubtasks: {
            isCached: true,
            expiresIn: HOUR,
        },
        getUserTasks: {
            isCached: true,
            expiresIn: HOUR,
        },
        getTask: {
            isCached: true,
            expiresIn: HOUR,
        },
        addCategory: {
            isCached: false,
            async after(db) {
                await removeCached(db, /TaskService.*getCategories/);
            },
        },
        updateTask: {
            isCached: false,
            async after(db, target, args, returnValue) {
                const id = +args[0];
                const updated = await target.getTask(id);
                await removeCached(db, new RegExp(`TaskService/getTask/${id}`));
                await removeCached(db, /TaskService.*getCategories/);
                await updateCached(db, /TaskService\/get/, (value) => {
                    if (Array.isArray(value)) {
                        return value.map((v: ITaskOverview) => v.Id === id ? updated : v);
                    }
                    return value;
                })
            },
        },
        'createTask|createSubtask': {
            isPattern: true,
            isCached: false,
            async after(db) {
                await removeCached(db, /TaskService.*/);
            },
        }
    }
})