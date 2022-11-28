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
    DetailsRow,
    Dialog,
    IGroup,
    SelectionMode,
} from 'office-ui-fabric-react';
import * as React from 'react';
import { IProcessFlowRow } from '../../models/IProcessFlowRow';
import ProcessFlowWebPart from '../../ProcessFlowWebPart';
import { MainService } from '../../services/main-service';
import { GlobalContext } from '../../utils/globalContext';
import { headerProps, renderHeader } from './header';
import styles from './ProcessFlowTable.module.scss';
import { useColumns } from './useColumns';
import { UserCell } from './UserCell';

export interface IProcessFlowTableProps {
    flow?: ICustomerFlow;
}

/**
Id: number;
System: string;
Procedure: string;
Category: string;
FlowId: number;
Manuals: string[];
 */
const NewProcess: React.FC<{
    systems: string[];
    processes: string[];
    categories: string[];
    flow: ICustomerFlow;
    onCloseForm: () => void;
    onNewProcess: (id: number) => void;
}> = (props) => {
    const processService = MainService.ProcessService;
    const [system, setSystem] = React.useState('');
    const [category, setCategory] = React.useState('');
    const [process, setProcess] = React.useState('');

    const handleCreate = async (): Promise<void> => {
        const newProcess = await processService.addProcess({
            System: system,
            Process: process,
            Category: category,
            FlowId: props.flow.Id,
        });
        props.onNewProcess(newProcess.data.Id);
    };

    return (
        <div>
            <div>
                <label style={{ display: 'block' }} htmlFor="System">
                    System:
                </label>
                <input
                    list="systemChoices"
                    id="system"
                    value={system}
                    onChange={(ev) => setSystem(ev.target.value)}
                />

                <datalist id="systemChoices">
                    {props.systems.map((s) => (
                        <option key={s} value={s} />
                    ))}
                </datalist>
            </div>
            <div>
                <label style={{ display: 'block' }} htmlFor="Process">
                    Process:
                </label>
                <input
                    list="processList"
                    id="Process"
                    value={process}
                    onChange={(ev) => setProcess(ev.target.value)}
                />

                <datalist id="processList">
                    {props.processes.map((p) => (
                        <option key={p} value={p} />
                    ))}
                </datalist>
            </div>
            <div>
                <label style={{ display: 'block' }} htmlFor="Category">
                    Category:
                </label>
                <input
                    list="categoryChoices"
                    id="Category"
                    value={category}
                    onChange={(ev) => setCategory(ev.target.value)}
                />

                <datalist id="categoryChoices">
                    {props.categories.map((c) => (
                        <option key={c} value={c} />
                    ))}
                </datalist>
            </div>
            <button onClick={handleCreate}>Create</button>
            <button onClick={props.onCloseForm}>Cancel</button>
        </div>
    );
};

const NewLocationDialog: React.FC<{
    hidden: boolean;
    onHide: () => void;
    processId: number;
    flowId: number;
    locationOptions: string[];
    doneByOptions: string[];
    onLocationAded: (id: number) => void;
}> = (props) => {
    const { FlowLocationService } = MainService;
    const [location, setLocation] = React.useState('');
    const [doneBy, setDoneBy] = React.useState('');

    const handleCreate = async (): Promise<void> => {
        const added = await FlowLocationService.addFlowLocation({
            Location: location,
            DoneBy: [doneBy],
            ProcessId: props.processId,
            FlowId: props.flowId,
        });
        props.onLocationAded(added.data.Id);
        props.onHide();
    };

    return (
        <Dialog
            hidden={props.hidden}
            onDismiss={props.onHide}
            modalProps={{ isBlocking: false }}
        >
            <div>
                <label style={{ display: 'block' }} htmlFor="location">
                    Location:{' '}
                </label>
                <input
                    list="locationChoices"
                    id="location"
                    onChange={(ev) => setLocation(ev.target.value)}
                />
                <datalist id="locationChoices">
                    {props.locationOptions.map((l) => (
                        <option key={l} value={l} />
                    ))}
                </datalist>
            </div>

            <div>
                <label style={{ display: 'block' }} htmlFor="doneBy">
                    Done by:{' '}
                </label>
                <input
                    list="doneByChoices"
                    id="doneBy"
                    onChange={(ev) => setDoneBy(ev.target.value)}
                />
                <datalist id="doneByChoices">
                    {props.doneByOptions.map((d) => (
                        <option key={d} value={d} />
                    ))}
                </datalist>
            </div>
            <div>
                <button onClick={handleCreate}>Create</button>
            </div>
        </Dialog>
    );
};

export const ProcessFlowTable: React.FC<IProcessFlowTableProps> = (props) => {
    const theme = ProcessFlowWebPart.currentTheme;
    const { ProcessService, FlowLocationService, UserProcessService } =
        MainService;
    const { teamUsers } = React.useContext(GlobalContext);
    // const [systems, setSystems] = React.useState([]);
    // const [processOptions, setProcessOptions] = React.useState([]);
    // const [locationOptions, setLocationOptions] = React.useState([]);
    // const [doneByOptions, setDoneByOptions] = React.useState([]);
    // const [categories, setCategories] = React.useState([]);
    // const [showNew, setShowNew] = React.useState<boolean>(false);
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
        return sortBy(
            processes.map((p) => {
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
            }),
            (o) => o.process.Category
        );
    }, [processes, flowLocations, userProcesses, columnUsers]);

    const grouped = React.useMemo(
        () => groupBy(items, (i) => i.process.Category),
        [items]
    );
    const tableGroups: IGroup[] = React.useMemo(() => {
        let startindex = 0;
        return Object.keys(grouped).map((category) => {
            const idx = startindex;
            startindex += grouped[category].length;
            return {
                key: category,
                name: category,
                startIndex: idx,
                count: grouped[category].length,
            };
        });
    }, [grouped]);

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

    if (!props.flow) return null;

    return (
        <div className={styles.container}>
            <DetailsList
                groupProps={{
                    onRenderHeader: renderHeader,
                    headerProps: headerProps(theme),
                }}
                compact
                groups={tableGroups}
                columns={columns}
                items={items}
                selectionMode={SelectionMode.none}
                layoutMode={DetailsListLayoutMode.fixedColumns}
            />
            {/* <Text variant="medium" block>
                {props.flow.Flow} selected
            </Text>
            <button onClick={() => setShowNew(true)}>New process</button>
            {showNew ? (
                <NewProcess
                    systems={systems}
                    processes={processOptions}
                    categories={categories}
                    flow={props.flow}
                    onCloseForm={() => setShowNew(false)}
                    onNewProcess={async (id) => {
                        const newProcess = await ProcessService.getProcess(id);
                        setProcesses((prev) => [...prev, newProcess]);
                        setShowNew(false);
                    }}
                />
            ) : null}
            {processes.map((p) => (
                <Process
                    key={p.Id}
                    process={p}
                    flow={props.flow}
                    locations={flowLocations.filter(
                        (l) => l.Process.Id === p.Id
                    )}
                    locationOptions={locationOptions}
                    doneByOptions={doneByOptions}
                    onLocationAdded={async (id: number) => {
                        const added = await FlowLocationService.getLocation(id);
                        setFlowLocations((prev) => [...prev, added]);
                    }}
                />
            ))} */}
        </div>
    );
};
