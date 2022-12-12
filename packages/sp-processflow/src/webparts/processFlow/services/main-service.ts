import {
    CustomerFlowService,
    FlowLocationService,
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
    },
};

const userProcessCacheOptions: ICacheProxyOptions<UserProcessService> = {
    dbName: DB_NAME,
    storeName: STORE_NAME,
    prefix: 'UserProcessService',
    props: {
        getByFlow: { isCached: true, expiresIn: HOUR * 3 },
        addUserProcess: {
            after: async (db, service, args, returnValue) => {
                const flowId = args[0].FlowId;
                const addedProcess = await service.getById(returnValue.data.Id);
                await updateCached(
                    db,
                    /UserProcessService\/getByFlow/,
                    (values, key) => {
                        if (key.endsWith(flowId)) {
                            return [...values, addedProcess];
                        }
                        return values;
                    }
                );
            },
        },
        updateUserProcess: {
            after: async (db, service, args) => {
                const updatedId = args[0];
                const updatedItem = await service.getById(updatedId);
                await updateCached(
                    db,
                    /UserProcessService\/getByFlow/,
                    (values, key) => {
                        if (key.endsWith(updatedItem.FlowId.toString())) {
                            return values.map((v: IUserProcess) =>
                                v.Id === updatedItem.Id ? updatedItem : v
                            );
                        }
                        return values;
                    }
                );
            },
        },
        removeUserProcess: {
            after: async (db, _service, args) => {
                const removedId = +args[0];
                await updateCached(
                    db,
                    /UserProcessService\/getByFlow/,
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
        '(getByFlow|get.*Choices)': {
            isPattern: true,
            isCached: true,
            expiresIn: HOUR * 12,
        },
        '(addFlowLocation|addFlowLocations)': {
            isPattern: true,
            after: async (db) => {
                await removeCached(db, /FlowLocationService.*getByFlow/);
                await removeCached(db, /FlowLocationService.*DoneBy*Choices/);
                await removeCached(db, /FlowLocationService.*Location*Choices/);
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
        config: IProcessFlowConfig;
    }): void {
        this.UserService = createCacheProxy(
            new UserService({
                sp: options.sp,
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
