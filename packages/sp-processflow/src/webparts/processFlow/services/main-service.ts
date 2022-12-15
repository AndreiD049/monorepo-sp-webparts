import {
    CustomerFlowService,
    FlowLocationService,
    IFlowLocation,
    IProcess,
    IUserProcess,
    ProcessService,
    UserProcessService,
} from '@service/process-flow';
import { UserService } from '@service/users';
import { SPFI } from 'sp-preset';
import { IProcessFlowConfig } from '../IProcessFlowConfig';
import {
    createCacheProxy,
    ICacheProxyOptions,
    removeCached,
    updateCached,
} from 'idb-proxy';
import { DB_NAME, HOUR, STORE_NAME } from '../utils/constants';
import {
    locationAdded,
    locationDeleted,
    locationUpdated,
    processUpdated,
    userProcessAdded,
    userProcessUpdated,
} from '../utils/events';

const userCacheOptions: ICacheProxyOptions<UserService> = {
    dbName: DB_NAME,
    storeName: STORE_NAME,
    prefix: 'UserService',
    props: {
        getCurrentUser: {
            isCached: true,
            expiresIn: HOUR,
        },
        getTeamsChoices: {
            isCached: true,
            expiresIn: HOUR,
        },
        getUsersByTeam: {
            isCached: true,
            expiresIn: HOUR,
        },
    },
};

const customerFlowCacheOptions: ICacheProxyOptions<CustomerFlowService> = {
    dbName: DB_NAME,
    storeName: STORE_NAME,
    prefix: 'CustomerFlowService',
    props: {
        '(getAll|getByTeam|get.*Choices)': {
            isCached: true,
            isPattern: true,
            expiresIn: HOUR,
        },
        addFlow: {
            after: async (db, service, _args, result) => {
                const resultId = result.data.Id;
                const newValue = await service.getById(resultId);
                await updateCached(db, /getAll/, (values) => [
                    ...values,
                    newValue,
                ]);
                await removeCached(db, /getByTeam/);
                await removeCached(db, /get.*Choices/);
            },
        },
        updateFlow: {
            after: async (db) => {
                await removeCached(db, new RegExp('get.*'));
            },
        },
    },
};

const processCacheOptions: ICacheProxyOptions<ProcessService> = {
    dbName: DB_NAME,
    storeName: STORE_NAME,
    prefix: 'ProcessService',
    props: {
        '(getByFlow|get.*Choices|get.*Options)': {
            isPattern: true,
            isCached: true,
            expiresIn: HOUR,
        },
        '(addProcess|addProcesses|removeProcess)': {
            isPattern: true,
            after: async (db) => {
                await removeCached(
                    db,
                    new RegExp('(getByFlow|get.*Choices|get.*Options)')
                );
            },
        },
        'updateProcess': {
            isPattern: true,
            after: async (db, service, args, returnValue) => {
                const id: number = args[0];
                const newProcess = await service.getById(id);
                await removeCached(
                    db,
                    new RegExp('(get.*Choices|get.*Options)')
                );
                await updateCached(db, /ProcessService.*getBy.*/, (values) => {
                    return values.map((process: IProcess) => process.Id === id ? newProcess : process);
                });
                processUpdated(newProcess);
            }
        }
    },
};

const userProcessCacheOptions: ICacheProxyOptions<UserProcessService> = {
    dbName: DB_NAME,
    storeName: STORE_NAME,
    prefix: 'UserProcessService',
    props: {
        '(getByFlow|getByProcess)': { isPattern: true, isCached: true, expiresIn: HOUR * 3 },
        addUserProcess: {
            after: async (db, service, args, returnValue) => {
                const flowId = args[0].FlowId;
                const processId = args[0].ProcessId;
                const addedProcess = await service.getById(returnValue.data.Id);
                await updateCached(
                    db,
                    /UserProcessService\/getBy.*/,
                    (values, key) => {
                        if (/getByFlow/.test(key) && key.endsWith(flowId)) {
                            return [...values, addedProcess];
                        }
                        if (/getByProcess/.test(key) && key.endsWith(processId)) {
                            return [...values, addedProcess];
                        }
                        return values;
                    }
                );
                userProcessAdded(addedProcess);
            },
        },
        updateUserProcess: {
            after: async (db, service, args) => {
                const updatedId = args[0];
                const updatedItem = await service.getById(updatedId);
                const flowId = updatedItem.FlowId.toString();
                const processId = updatedItem.ProcessId.toString();
                await updateCached(
                    db,
                    /UserProcessService\/getBy.*/,
                    (values, key) => {
                        if (/getByFlow/.test(key) && key.endsWith(flowId)) {
                            return values.map((v: IUserProcess) =>
                                v.Id === updatedItem.Id ? updatedItem : v
                            );
                        }
                        if (/getByProcess/.test(key) && key.endsWith(processId)) {
                            return values.map((v: IUserProcess) =>
                                v.Id === updatedItem.Id ? updatedItem : v
                            );
                        }
                        return values;
                    }
                );
                userProcessUpdated(updatedItem);
            },
        },
        removeUserProcess: {
            after: async (db, _service, args) => {
                const removedId = +args[0];
                await updateCached(
                    db,
                    /UserProcessService\/getBy.*/,
                    (values: IUserProcess[]) =>
                        values.filter((v) => v.Id !== removedId)
                );
            },
        },
    },
};

const locationCacheOptions: ICacheProxyOptions<FlowLocationService> = {
    dbName: DB_NAME,
    storeName: STORE_NAME,
    prefix: 'FlowLocationService',
    props: {
        '(getBy.*|get.*Choices)': {
            isPattern: true,
            isCached: true,
            expiresIn: HOUR * 12,
        },
        '(addFlowLocation|addFlowLocations)': {
            isPattern: true,
            after: async (db, service, args, returnValue) => {
                await removeCached(db, /FlowLocationService.*getBy.*/);
                await removeCached(db, /FlowLocationService.*DoneBy.*Choices/);
                await removeCached(
                    db,
                    /FlowLocationService.*Location.*Choices/
                );
                if (!Array.isArray(args[0])) {
                    locationAdded(
                        await service.getLocation(returnValue.data.Id)
                    );
                }
            },
        },
        updateFlowLocation: {
            isPattern: true,
            after: async (db, service, args) => {
                const id: number = args[0];
                const updatedItem = await service.getLocation(id);
                const flowId = updatedItem.FlowId.toString();
                const processId = updatedItem.Process.Id.toString();
                await updateCached(
                    db,
                    /FlowLocationService.*getBy.*/,
                    (values, key) => {
                        if (
                            (/getByFlow/.test(key) && key.includes(flowId)) ||
                            (/getByProcess/.test(key) &&
                                key.includes(processId))
                        ) {
                            return values.map((v: IFlowLocation) =>
                                v.Id === id ? updatedItem : v
                            );
                        }
                        return values;
                    }
                );
                locationUpdated(updatedItem);
            },
        },
        removeFlowLocation: {
            isPattern: true,
            after: async (db, service, args) => {
                const id: number = args[0];
                await updateCached(
                    db,
                    /FlowLocationService.*getBy.*/,
                    (values) => {
                        return values.filter((v: IFlowLocation) => v.Id !== id);
                    }
                );
                locationDeleted(id);
            },
        },
    },
};

export class MainService {
    public static UserService: UserService = null;
    public static CustomerFlowService: CustomerFlowService = null;
    public static ProcessService: ProcessService = null;
    public static UserProcessService: UserProcessService = null;
    public static FlowLocationService: FlowLocationService = null;

    public static InitServices(options: {
        sp: SPFI;
        userSP: SPFI;
        config: IProcessFlowConfig;
    }): void {
        this.UserService = createCacheProxy(
            new UserService({
                sp: options.userSP,
                listName: options.config.userListName,
            }),
            userCacheOptions
        );

        this.CustomerFlowService = createCacheProxy(
            new CustomerFlowService({
                sp: options.sp,
                listName: options.config.customerFlowListName,
            }),
            customerFlowCacheOptions
        );

        this.ProcessService = createCacheProxy(
            new ProcessService({
                sp: options.sp,
                listName: options.config.processListName,
            }),
            processCacheOptions
        );

        this.UserProcessService = createCacheProxy(
            new UserProcessService({
                sp: options.sp,
                listName: options.config.userProcessListName,
            }),
            userProcessCacheOptions
        );

        this.FlowLocationService = createCacheProxy(
            new FlowLocationService({
                sp: options.sp,
                listName: options.config.locationListName,
            }),
            locationCacheOptions
        );
    }
}
