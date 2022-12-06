import { groupBy, sortBy, uniq } from '@microsoft/sp-lodash-subset';
import {
    ICustomerFlow,
    IFlowLocation,
    IProcess,
    IUserProcess,
} from '@service/process-flow';
import {
    DetailsList,
    DetailsListLayoutMode,
    IGroup,
    SelectionMode,
} from 'office-ui-fabric-react';
import * as React from 'react';
import useWebStorage from 'use-web-storage-api';
import { IProcessFlowRow } from '../../models/IProcessFlowRow';
import ProcessFlowWebPart from '../../ProcessFlowWebPart';
import { MainService } from '../../services/main-service';
import { GROUP_SORTING_KEY } from '../../utils/constants';
import {
    EventPayload,
    listenProcessAdded,
    listenUserProcessAdded,
    listenUserProcessUpdated,
} from '../../utils/events';
import { GlobalContext } from '../../utils/globalContext';
import { headerProps, renderHeader } from './header';
import styles from './ProcessFlowTable.module.scss';
import { useColumns } from './useColumns';
import { useGroups } from './useGroups';

export interface IProcessFlowTableProps {
    flow?: ICustomerFlow;
}

export const ProcessFlowTable: React.FC<IProcessFlowTableProps> = (props) => {
    const theme = ProcessFlowWebPart.currentTheme;
    const { ProcessService, FlowLocationService, UserProcessService } =
        MainService;
    const { teamUsers } = React.useContext(GlobalContext);
    const [groupSorting, setGroupSorting] = useWebStorage<{
        [key: number]: string[];
    }>(
        {},
        {
            key: GROUP_SORTING_KEY,
        }
    );
    const [processes, setProcesses] = React.useState<IProcess[]>([]);
    const [flowLocations, setFlowLocations] = React.useState<IFlowLocation[]>(
        []
    );
    const [userProcesses, setUserProcesses] = React.useState<IUserProcess[]>(
        []
    );

    const columnUsers = React.useMemo(() => {
        const userSet = new Set(teamUsers.map((u) => u.User.Id));
        const result = teamUsers.map((u) => u.User);
        userProcesses.forEach((up) => {
            if (!userSet.has(up.User.Id)) {
                result.push(up.User);
                userSet.add(up.User.Id);
            }
        });
        return result;
    }, [userProcesses]);

    const locations = React.useMemo(
        () => uniq(flowLocations.map((l) => l.Location)),
        [flowLocations]
    );
    const columns = useColumns({
        locations,
        users: columnUsers,
    });
    const items: IProcessFlowRow[] = React.useMemo(() => {
        const locationsByProcess: { [id: number]: IFlowLocation[] } = {};
        flowLocations.forEach((l) => {
            if (l.Process) {
                if (!locationsByProcess[l.Process.Id]) {
                    locationsByProcess[l.Process.Id] = [];
                }
                locationsByProcess[l.Process.Id].push(l);
            }
        });
        const userProcessesByProcess: { [id: number]: IUserProcess[] } =
            userProcesses.reduce<{ [id: number]: IUserProcess[] }>(
                (obj, userProcess) => {
                    if (!obj[userProcess.ProcessId]) {
                        obj[userProcess.ProcessId] = [];
                    }
                    obj[userProcess.ProcessId].push(userProcess);
                    return obj;
                },
                {}
            );
        return processes.map((p) => {
            let locations: IProcessFlowRow['locations'] = {};
            if (locationsByProcess[p.Id]) {
                locations = locationsByProcess[p.Id].reduce(
                    (obj: IProcessFlowRow['locations'], location) => {
                        obj[location.Location.toUpperCase()] = location;
                        return obj;
                    },
                    {}
                );
            }
            const processes = userProcessesByProcess[p.Id];
            const users = columnUsers.reduce<IProcessFlowRow['users']>(
                (obj, user) => {
                    if (!obj[user.Id]) {
                        obj[user.Id] = processes?.find(
                            (p) => p.User.Id === user.Id
                        );
                    }
                    return obj;
                },
                {}
            );
            return {
                process: p,
                locations,
                users,
            };
        });
    }, [processes, flowLocations, userProcesses, columnUsers]);

    const groupping = useGroups({
        flow: props.flow,
        groupSorting,
        items,
        setGroupSorting
    });

    React.useEffect(() => {
        async function run(): Promise<void> {
            if (props.flow) {
                setProcesses(await ProcessService.getByFlow(props.flow.Id));
                setFlowLocations(
                    await FlowLocationService.getByFlow(props.flow.Id)
                );
                setUserProcesses(
                    await UserProcessService.getByFlow(props.flow.Id)
                );
            }
        }
        run().catch((err) => console.error(err));
    }, [props.flow]);

    // Process events
    React.useEffect(() => {
        async function handler(data: EventPayload): Promise<void> {
            const newUserProcess = await UserProcessService.getById(data.id);
            setUserProcesses((prev) =>
                prev.filter((up) => up.Id !== data.id).concat(newUserProcess)
            );
        }
        async function processHandler(data: EventPayload): Promise<void> {
            const newProcess = await ProcessService.getById(data.id);
            setProcesses((prev) => [...prev, newProcess]);
        }
        const update = listenUserProcessUpdated(handler);
        const add = listenUserProcessAdded(handler);
        const addProcess = listenProcessAdded(processHandler);
        return () => {
            update();
            add();
            addProcess();
        };
    }, []);

    if (!props.flow) return null;

    return (
        <div className={styles.container}>
            <DetailsList
                groupProps={groupping.groupProps}
                compact
                groups={groupping.groups}
                columns={columns}
                items={groupping.sortedItems}
                selectionMode={SelectionMode.none}
                layoutMode={DetailsListLayoutMode.fixedColumns}
            />
        </div>
    );
};
