/* eslint-disable @rushstack/security/no-unsafe-regexp */
import { ActionService, TaskService } from "@service/sp-cip";
import { ICacheProxyOptions, removeCached } from "idb-proxy";
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
		getTaskTimingInfo: {
			isCached: true,
			expiresIn: MINUTE * 10,
		},
        addCategory: {
            isCached: false,
            async after(db) {
                await removeCached(db, /TaskService.*getCategories/);
            },
        },
        updateTask: {
            isCached: false,
            async after(db, _, args) {
                const id = +args[0];
				const payload = args[1];
                await removeCached(db, /TaskService\/getAll.*/);
                await removeCached(db, new RegExp(`TaskService/getTask/${id}`));
				if (payload.EstimatedTime || payload.EffectiveTime) {
					await removeCached(db, /TaskService\/getTaskTimingInfo.*/);
				}
            },
        },
		deleteTaskAndSubtasks: {
			isCached: false,
			async after(db, _, args) {
                const id = +args[0].Id;
				await removeCached(db, /TaskService\/getAll.*/);
                await removeCached(db, new RegExp(`TaskService/getTask/${id}`));
			},
		},
        'createTask|createSubtask': {
            isPattern: true,
            isCached: false,
            async after(db) {
                await removeCached(db, /TaskService\/getAll/);
            }
        }
    }
});

export const actionLogTaskServiceProxyOptions: (remote: string) => ICacheProxyOptions<TaskService> = (remote) => ({
    dbName: DB_NAME,
    storeName: STORE_NAME,
    prefix: `${remote}/TaskService`,
    props: {
        getTask: {
            isCached: true,
            expiresIn: 12 * HOUR,
        },
    }
});

export const actionServiceProxyOptions: (remote: string) => ICacheProxyOptions<ActionService> = (remote) => ({
    dbName: DB_NAME,
    storeName: STORE_NAME,
    prefix: `${remote}/ActionService`,
    props: {
        getActionsFromTo: {
            isCached: true,
            getKey: (args) => {
                const dateFrom: Date = args[0];
                const dateTo: Date = args[1];
                return `/${dateFrom?.toLocaleDateString()}-${dateTo?.toLocaleDateString()}`;
            },
            expiresIn: 15 * MINUTE,
        },
        addAction: {
            isCached: false,
            after: async (db) => {
                await removeCached(db, /ActionService\/getActionsFromTo/);
            }
        },
        updateAction: {
            isCached: false,
            after: async (db) => {
                await removeCached(db, /ActionService\/getActionsFromTo/);
            }
        },
    }
});
