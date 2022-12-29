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
import { GROUP_SORTING_KEY, LOADING_SPINNER } from '../../utils/constants';
import {
    listenLocationsAdded,
    listenLocationDeleted,
    listenLocationUpdated,
    listenProcessAdded,
    listenUserProcessAdded,
    listenUserProcessUpdated,
    listenLocationAdded,
    listenProcessUpdated,
    listenUserProcessRemoved,
    listenProcessRemoved,
} from '../../utils/events';
import { GlobalContext } from '../../utils/globalContext';
import styles from './ProcessFlowTable.module.scss';
import { useColumns } from './useColumns';
import { useGroups } from './useGroups';
import { useCopyPaste } from './useCopyPaste';
import { hideSpinner, showSpinner } from 'sp-components';

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
    const [search, setSearch] = React.useState(
        searchParams.get('search') || ''
    );
    const navigate = useNavigate();
    const { ProcessService, FlowLocationService, UserProcessService } =
        MainService;
    const { teamUsers, selectedTeam, selectedFlow } = React.useContext(GlobalContext);
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

    React.useEffect(() => {
        const value = searchParams.get('search');
        if (value !== search) {
            setSearch(value || '');
        }
    }, [searchParams, search]);

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
    // Copy paste of cells
    useCopyPaste();

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
        const searchVal = search.toLowerCase();
        const filteredProcesses =
            searchVal === ''
                ? processes
                : processes.filter((p) =>
                      p.Title.toLowerCase().includes(searchVal)
                  );
        return filteredProcesses.map((p) => {
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
    }, [processes, flowLocations, userProcesses, columnUsers, search]);

    const groupping = useGroups({
        flow: props.flow,
        groupSorting,
        items,
        setGroupSorting,
    });

    React.useEffect(() => {
        async function run(): Promise<void> {
            try {
                showSpinner(LOADING_SPINNER);
                if (props.flow) {
                    setProcesses(await ProcessService.getByFlow(props.flow.Id));
                    setFlowLocations(
                        await FlowLocationService.getByFlow(props.flow.Id)
                    );
                    setUserProcesses(
                        await UserProcessService.getByFlow(props.flow.Id)
                    );
                }
            } finally {
                hideSpinner(LOADING_SPINNER);
            }
        }
        run().catch((err) => console.error(err));
    }, [props.flow]);

    // Process events
    React.useEffect(() => {
        async function userProcessAddedHandler(
            data: IUserProcess
        ): Promise<void> {
            setUserProcesses((prev) =>
                prev.filter((up) => up.Id !== data.Id).concat(data)
            );
        }
        async function userProcessRemovedHandler(data: number): Promise<void> {
            setUserProcesses((prev) => prev.filter((up) => up.Id !== data));
        }
        async function processAddedHandler(data: number): Promise<void> {
            const newProcess = await ProcessService.getById(data);
            setProcesses((prev) => [...prev, newProcess]);
        }
        async function processUpdatedHandler(data: IProcess): Promise<void> {
            setProcesses((prev) =>
                prev.map((p) => (p.Id === data.Id ? data : p))
            );
        }
        async function processRemovedHandler(id: number): Promise<void> {
            setProcesses((prev) => prev.filter((p) => p.Id !== id));
        }
        async function locationsHandler(): Promise<void> {
            setFlowLocations(
                await FlowLocationService.getByFlow(props.flow.Id)
            );
        }
        async function locationAddedHandler(
            data: IFlowLocation
        ): Promise<void> {
            setFlowLocations((prev) => [...prev, data]);
        }
        async function updateLocationHandler(
            data: IFlowLocation
        ): Promise<void> {
            setFlowLocations((prev) =>
                prev.map((p) => (p.Id === data.Id ? data : p))
            );
        }
        async function locationDeleteHandler(data: number): Promise<void> {
            setFlowLocations((prev) => prev.filter((l) => l.Id !== data));
        }
        const userProcessUpdate = listenUserProcessUpdated(userProcessAddedHandler);
        const userProcessAdded = listenUserProcessAdded(userProcessAddedHandler);
        const userProcessRemoved = listenUserProcessRemoved(userProcessRemovedHandler);
        const addProcess = listenProcessAdded(processAddedHandler);
        const updateProcess = listenProcessUpdated(processUpdatedHandler);
        const removeProcess = listenProcessRemoved(processRemovedHandler);
        const addLocations = listenLocationsAdded(locationsHandler);
        const addLocation = listenLocationAdded(locationAddedHandler);
        const updateLocation = listenLocationUpdated(updateLocationHandler);
        const deleteLocation = listenLocationDeleted(locationDeleteHandler);
        return () => {
            userProcessUpdate();
            userProcessAdded();
            userProcessRemoved();
            addProcess();
            updateProcess();
            removeProcess();
            addLocation();
            addLocations();
            updateLocation();
            deleteLocation();
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
                    navigate(
                        `/team/${selectedTeam}/flow/${selectedFlow.Id}/process/${item.process.Id}?${searchParams.toString()}`
                    );
                }}
            />
        </div>
    );
};
