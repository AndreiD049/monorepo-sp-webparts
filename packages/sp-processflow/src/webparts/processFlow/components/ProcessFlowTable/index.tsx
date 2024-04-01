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
    IGroup,
    IStyleFunctionOrObject,
    SelectionMode,
} from '@fluentui/react';
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
        "& [role=gridcell][aria-colindex='3']": {
            borderRight: '1px solid ' + currentTheme.palette.neutralLighterAlt,
            backgroundColor: currentTheme.palette.white,
            position: 'sticky',
            left: 0,
            zIndex: 100,
        },

        "& [role=columnheader][aria-colindex='2']": {
            backgroundColor: currentTheme.palette.white,
            position: 'sticky',
            left: 0,
            zIndex: 100,
        },
        "& [role=row]:hover [role=gridcell][aria-colindex='3'], & [role=columnheader][aria-colindex='2']:hover":
            {
                backgroundColor: currentTheme.palette.neutralLighter,
            },
        overflow: 'visible',
    },
    contentWrapper: {
        flex: '1 1 auto',
    },
    headerWrapper: {
        position: 'sticky',
        top: -1,
        zIndex: 1,
    },
});

export const ProcessFlowTable: React.FC<IProcessFlowTableProps> = (props) => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [search, setSearch] = React.useState(
        searchParams.get('search') || ''
    );
    const { ProcessService, FlowLocationService, UserProcessService } =
        MainService;
    const { teamUsers, selectedTeam, selectedFlow } =
        React.useContext(GlobalContext);
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

    // Drag n drop rows
    const [draggedItem, setDraggedItem] = React.useState<IProcessFlowRow>(null);

    React.useEffect(() => {
        const value = searchParams.get('search');
        if (value !== search) {
            setSearch(value || '');
        }
    }, [searchParams, search]);

    const columnUsers = React.useMemo(() => {
        let result = teamUsers.map((u) => u.User);
        const usersParam = searchParams.get('users');
        const selectedUserIds = usersParam
            ? searchParams
                  .get('users')
                  .split(',')
                  .map((u) => parseInt(u))
                  .filter((u) => !isNaN(u))
            : [];

        if (selectedUserIds.length > 0) {
            result = result.filter((u) => selectedUserIds.includes(u.Id));
        }
        return result;
    }, [teamUsers, searchParams]);

    const responsibles = React.useMemo(() => {
        const responsibleParam = searchParams.get('responsible');
        if (!responsibleParam) {
            return [];
        }
        return responsibleParam.split(',').map((r) => parseInt(r));
    }, [searchParams]);

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
        let filteredProcesses =
            searchVal === ''
                ? processes
                : processes.filter((p) =>
                      p.Title.toLowerCase().includes(searchVal)
                  );
        // Show only processes that have responsibles
        if (responsibles.length > 0) {
            const noone = responsibles.indexOf(-1) > -1;
            if (noone) {
                filteredProcesses = filteredProcesses.filter(
                    (p) => !p.ResponsibleId
                );
            } else {
                filteredProcesses = filteredProcesses.filter(
                    (p) => responsibles.indexOf(p.ResponsibleId) > -1
                );
            }
        }
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
        const userProcessUpdate = listenUserProcessUpdated(
            userProcessAddedHandler
        );
        const userProcessAdded = listenUserProcessAdded(
            userProcessAddedHandler
        );
        const userProcessRemoved = listenUserProcessRemoved(
            userProcessRemovedHandler
        );
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
                dragDropEvents={{
                    canDrag: () => true,
                    canDrop: (drop) => {
                        if (!drop) return true;
                        const data: IProcessFlowRow | IGroup = drop.data;
                        // If we're dragging over a group header
                        if ('count' in data) return false;
                        // If we're dragging over the item itself
                        if (
                            'process' in data &&
                            draggedItem &&
                            draggedItem.process.Category !==
                                data.process.Category
                        )
                            return false;
                        return true;
                    },
                    onDragStart: (item: IProcessFlowRow, index) => {
                        if ('count' in item) return;
                        setDraggedItem(item);
                    },
                    onDragEnd: (item: IProcessFlowRow) => {
                        setDraggedItem(null);
                    },
                    onDragEnter: (item: IProcessFlowRow | IGroup) => {
                        // Drag over a group
                        if ('count' in item) {
                            return '';
                        }
                        // No dragged item
                        if (!draggedItem) {
                            return '';
                        }
                        // Dragging over itself
                        if (item.process.Id === draggedItem.process.Id) {
                            return '';
                        }
                        // Dragging over a different category
                        if (
                            item.process.Category !==
                            draggedItem.process.Category
                        ) {
                            return '';
                        }
                        // if dragging from bottom, show the top border, else bottom
                        const index = groupping.sortedItems.indexOf(item);
                        const draggedIndex =
                            groupping.sortedItems.indexOf(draggedItem);

                        if (index === -1 || draggedIndex === -1) {
                            return '';
                        }

                        if (index < draggedIndex) {
                            return styles.dragTop;
                        } else {
                            return styles.dragBottom;
                        }
                    },
                    onDragLeave: () => {
                        return;
                    },
                    onDrop: async (item: IProcessFlowRow) => {
                        if (!draggedItem) {
                            return;
                        }

                        showSpinner(LOADING_SPINNER);

                        // Only look at processes inside of the Category
                        const sortedInCategory = groupping.sortedItems.filter(
                            (i) =>
                                i.process.Category ===
                                draggedItem.process.Category
                        );
                        const draggedIndex =
                            sortedInCategory.indexOf(draggedItem);
                        const targetIndex = sortedInCategory.indexOf(item);

                        if (draggedIndex === -1 || targetIndex === -1) {
                            hideSpinner(LOADING_SPINNER);
                            return;
                        }

                        if (draggedIndex === targetIndex) {
                            hideSpinner(LOADING_SPINNER);
                            return;
                        }

                        // insert process at index
                        const processes = [
                            ...sortedInCategory.map((i) => i.process),
                        ];
                        const draggedProcess = processes.splice(
                            draggedIndex,
                            1
                        )[0];
                        processes.splice(targetIndex, 0, draggedProcess);

                        await ProcessService.updateProcessesOrdering(processes);

                        hideSpinner(LOADING_SPINNER);
                        return true;
                    },
                }}
                styles={listStyles(ProcessFlowWebPart.currentTheme)}
                onItemInvoked={(item) => {
                    navigate(
                        `/team/${encodeURIComponent(selectedTeam)}/flow/${
                            selectedFlow.Id
                        }/process/${item.process.Id}?${searchParams.toString()}`
                    );
                }}
            />
        </div>
    );
};
