import { IReadonlyTheme } from '@microsoft/sp-component-base';
import { uniq } from '@microsoft/sp-lodash-subset';
import {
    ICustomerFlow,
    IFlowLocation,
    IProcess,
    IUserProcess,
} from '@service/process-flow';
import {
    DetailsList,
    DetailsListLayoutMode,
    IDetailsListStyleProps,
    IDetailsListStyles,
    IStyleFunctionOrObject,
    SelectionMode,
} from 'office-ui-fabric-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import * as React from 'react';
import useWebStorage from 'use-web-storage-api';
import { IProcessFlowRow } from '../../models/IProcessFlowRow';
import ProcessFlowWebPart from '../../ProcessFlowWebPart';
import { MainService } from '../../services/main-service';
import { GROUP_SORTING_KEY } from '../../utils/constants';
import {
    EventPayload,
    listenLocationAdded,
    listenProcessAdded,
    listenUserProcessAdded,
    listenUserProcessUpdated,
} from '../../utils/events';
import { GlobalContext } from '../../utils/globalContext';
import styles from './ProcessFlowTable.module.scss';
import { useColumns } from './useColumns';
import { useGroups } from './useGroups';

export interface IProcessFlowTableProps {
    flow?: ICustomerFlow;
}

const listStyles: (
    theme: IReadonlyTheme
) => IStyleFunctionOrObject<IDetailsListStyleProps, IDetailsListStyles> = (
    currentTheme: IReadonlyTheme
) => ({
    root: {
        overflowX: 'auto',
        '& [role=grid]': {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'start',
            height: '70vh',
        },
        "& [role=gridcell][aria-colindex='3']": {
            borderRight: '1px solid ' + currentTheme.palette.neutralLighterAlt,
        },
        '&::-webkit-scrollbar': {
            width: '10px',
            height: '10px',
        },
        '&::-webkit-scrollbar-track': {
            backgroundColor: currentTheme.palette.neutralLighter,
        },
        '&::-webkit-scrollbar-thumb': {
            backgroundColor: currentTheme.palette.neutralTertiary,
            borderRadius: '6px',
        },
        '&::-webkit-scrollbar-thumb:hover': {
            backgroundColor: '#555',
        },
    },
    headerWrapper: {
        flex: '0 0 auto',
    },
    contentWrapper: {
        flex: '1 1 auto',
        overflowX: 'hidden',
        overflowY: 'auto',
        '&::-webkit-scrollbar': {
            width: '10px',
            height: '10px',
        },
        '&::-webkit-scrollbar-track': {
            backgroundColor: currentTheme.palette.neutralLighter,
        },
        '&::-webkit-scrollbar-thumb': {
            backgroundColor: currentTheme.palette.neutralTertiary,
            borderRadius: '6px',
        },
        '&::-webkit-scrollbar-thumb:hover': {
            backgroundColor: '#555',
        },
    },
});

export const ProcessFlowTable: React.FC<IProcessFlowTableProps> = (props) => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
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
        () => uniq(flowLocations.map((l) => l.Title)),
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
                        obj[location.Title.toUpperCase()] = location;
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
        setGroupSorting,
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
        async function locationsHandler(): Promise<void> {
            setFlowLocations(
                await FlowLocationService.getByFlow(props.flow.Id)
            );
        }
        const update = listenUserProcessUpdated(handler);
        const add = listenUserProcessAdded(handler);
        const addProcess = listenProcessAdded(processHandler);
        const addLocations = listenLocationAdded(locationsHandler);
        return () => {
            update();
            add();
            addProcess();
            addLocations();
        };
    }, [props.flow]);

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
                styles={listStyles(ProcessFlowWebPart.currentTheme)}
                onItemInvoked={(item) => {
                    navigate(`/process/${item.process.Id}?${searchParams.toString()}`);
                }}
            />
        </div>
    );
};
