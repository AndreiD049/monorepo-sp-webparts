import { groupBy } from '@microsoft/sp-lodash-subset';
import { IFlowLocation, IProcess, IUserProcess, readManualJson } from '@service/process-flow';
import { IManualJson } from '@service/process-flow/dist/models';
import { Dictionary } from 'lodash';
import {
    ActionButton,
    IconButton,
    Panel,
    PanelType,
    Persona,
    PersonaSize,
    Separator,
    Text,
    TextField,
} from 'office-ui-fabric-react';
import * as React from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
    Dialog,
    FooterYesNo,
    hideDialog,
    hideSpinner,
    LoadingSpinner,
    showDialog,
    showSpinner,
} from 'sp-components';
import { SPnotifyError } from 'sp-react-notifications';
import { MainService } from '../../services/main-service';
import {
    LOADING_SPINNER,
    LOADING_SPINNER_PANEL,
    PANEL_DIALOG,
} from '../../utils/constants';
import {
    listenLocationAdded,
    listenLocationDeleted,
    listenLocationUpdated,
    listenProcessUpdated,
    listenUserProcessUpdated,
} from '../../utils/events';
import { GlobalContext } from '../../utils/globalContext';
import { addLocation, deleteLocation, editLocation } from '../LocationDialog';
import {
    CategoryTextField,
    SystemTextField,
    UomTextField,
} from '../TextFields';
import { editUserProcess } from '../UserProcessStatusDialog';
import { ManualsOverview } from './ManualsOverview';
import styles from './ProcessDetails.module.scss';

export interface IProcessDetailsProps {
    // Props go here
}

const LocationDetails: React.FC<{ location: IFlowLocation }> = (props) => {
    const countries: string[][] = React.useMemo(() => {
        if (props.location.Country?.length) {
            return props.location.Country.map((c) => c.split(' - '));
        }
        return [];
    }, [props.location]);

    return (
        <tr className={styles.locationContainer}>
            <td>
                <span>
                    {countries.map((countryTokens) => (
                        <img
                            className={styles.countryFlag}
                            title={countryTokens[0]}
                            key={countryTokens[0]}
                            src={`https://flagcdn.com/24x18/${countryTokens[1].toLowerCase()}.png`}
                        />
                    ))}
                </span>
            </td>
            <td>
                <Text
                    variant="medium"
                    styles={{ root: { fontWeight: 'bold' } }}
                >
                    {props.location.Title}
                </Text>
            </td>
            <td>
                <Text variant="medium">
                    {props.location.DoneBy.join(' / ')}
                </Text>
            </td>
            <td>
                <IconButton
                    iconProps={{ iconName: 'Edit' }}
                    onClick={() => {
                        editLocation(props.location, PANEL_DIALOG);
                    }}
                />
                <IconButton
                    style={{ marginLeft: '4px' }}
                    iconProps={{ iconName: 'Delete' }}
                    onClick={() => {
                        deleteLocation(props.location, PANEL_DIALOG);
                    }}
                />
            </td>
        </tr>
    );
};

const StatusTable: React.FC<{
    groupped: Dictionary<IUserProcess[]>;
    process: IProcess;
    status: string;
}> = (props) => {
    if (!(props.status in props.groupped)) return null;

    return (
        <>
            <tr>
                <td colSpan={2} className={styles.categoryCell}>
                    <Text
                        variant="mediumPlus"
                        className={styles.overviewCategoryText}
                    >
                        {props.status} ({props.groupped[props.status].length})
                    </Text>
                </td>
            </tr>
            {props.groupped[props.status] &&
                props.groupped[props.status].map((i: IUserProcess) => (
                    <tr key={i.Id}>
                        <td>
                            <Persona
                                text={i.User.Title}
                                size={PersonaSize.size32}
                                imageUrl={`/_layouts/15/userphoto.aspx?accountname=${i.User.EMail}&Size=S`}
                            />
                        </td>
                        <td>
                            {i.Date
                                ? new Date(i.Date).toLocaleDateString()
                                : '-'}
                        </td>
                        <td>
                            <IconButton
                                className={styles.userEditButton}
                                iconProps={{ iconName: 'Edit' }}
                                onClick={() =>
                                    editUserProcess(
                                        props.process,
                                        i.User,
                                        i,
                                        PANEL_DIALOG
                                    )
                                }
                            />
                        </td>
                    </tr>
                ))}
        </>
    );
};

const UserProcessOverview: React.FC<{
    items: IUserProcess[];
    process: IProcess;
}> = (props) => {
    const groupped = React.useMemo(() => {
        return groupBy(props.items, (i) => i.Status);
    }, [props.items]);

    return (
        <div>
            <table className={styles.overviewTable}>
                <tbody>
                    <StatusTable
                        groupped={groupped}
                        process={props.process}
                        status="Planned"
                    />
                    <StatusTable
                        groupped={groupped}
                        process={props.process}
                        status="On-going"
                    />
                    <StatusTable
                        groupped={groupped}
                        process={props.process}
                        status="Completed"
                    />
                </tbody>
            </table>
        </div>
    );
};

const Details: React.FC<{ processId: number }> = (props) => {
    const { selectedTeam, selectedFlow } = React.useContext(GlobalContext);
    const { ProcessService, FlowLocationService, UserProcessService } =
        MainService;
    const [process, setProcess] = React.useState<IProcess>(null);
    const manuals: IManualJson[] = React.useMemo(() => {
		if (!process) return [];
        return readManualJson(process.Manual);
    }, [process]);
    const [locations, setLocations] = React.useState<IFlowLocation[]>([]);
    const [userProcesses, setUserProcesses] = React.useState<IUserProcess[]>(
        []
    );
    const [editable, setEditable] = React.useState(false);
    const [data, setData] = React.useState<Partial<IProcess>>({});
    const navigate = useNavigate();

    React.useEffect(() => {
        if (editable) {
            setData({
                System: process.System,
                Title: process.Title,
                Category: process.Category,
                Allocation: process.Allocation,
                UOM: process.UOM,
            });
        }
    }, [editable, process]);

    React.useEffect(() => {
        async function run(): Promise<void> {
            if (Number.isInteger(props.processId)) {
                setProcess(await ProcessService.getById(+props.processId));
                setLocations(
                    await FlowLocationService.getByProcess(+props.processId)
                );
                setUserProcesses(
                    await UserProcessService.getByProcess(+props.processId)
                );
            }
        }
        run().catch((err) => console.error(err));
    }, [props.processId]);

    React.useEffect(() => {
        async function locationAddedHandler(
            data: IFlowLocation
        ): Promise<void> {
            if (props.processId === data.Process.Id) {
                setLocations((prev) => [...prev, data]);
            }
        }
        async function locationUpdatedHandler(
            data: IFlowLocation
        ): Promise<void> {
            setLocations((prev) =>
                prev.map((l) => (l.Id === data.Id ? data : l))
            );
        }
        async function processUpdated(data: IProcess): Promise<void> {
            if (process.Id === data.Id) {
                setProcess(data);
            }
        }
        async function locationDeleteHandler(data: number): Promise<void> {
            setLocations((prev) => prev.filter((l) => l.Id !== data));
        }
        async function userProcessUpdatedHandler(
            data: IUserProcess
        ): Promise<void> {
            setUserProcesses((prev) =>
                prev.map((up) => (up.Id === data.Id ? data : up))
            );
        }
        const removeProcessUpdated = listenProcessUpdated(processUpdated);
        const removeLocationAdd = listenLocationAdded(locationAddedHandler);
        const removeLocationUpd = listenLocationUpdated(locationUpdatedHandler);
        const removeLocationDel = listenLocationDeleted(locationDeleteHandler);
        const removeUserProcessUpdated = listenUserProcessUpdated(
            userProcessUpdatedHandler
        );
        return () => {
            removeProcessUpdated();
            removeLocationAdd();
            removeLocationUpd();
            removeLocationDel();
            removeUserProcessUpdated();
        };
    }, [locations, process]);

    const handleSave = React.useCallback(async () => {
        const keys = Object.keys(data);
        let changed = false;
        keys.forEach((k: keyof IProcess) => {
            if (data[k] !== process[k]) changed = true;
        });
        if (changed) {
            await ProcessService.updateProcess(process.Id, data);
        }
        setEditable(false);
    }, [data, process]);

    const handleDelete = React.useCallback(() => {
        showDialog({
            id: PANEL_DIALOG,
            dialogProps: {
                dialogContentProps: {
                    title: 'Delete process',
                    subText: `The process '${process.Title}' and all training records will be deleted. Are you sure?`,
                },
            },
            footer: (
                <FooterYesNo
                    onYes={async () => {
                        try {
                            hideDialog(PANEL_DIALOG);
                            navigate(
                                `/team/${selectedTeam}/flow/${selectedFlow.Id}`
                            );
                            showSpinner(LOADING_SPINNER);
                            for (const up of userProcesses) {
                                await UserProcessService.removeUserProcess(
                                    up.Id
                                );
                            }
                            for (const l of locations) {
                                await FlowLocationService.removeFlowLocation(
                                    l.Id
                                );
                            }
                            await ProcessService.removeProcess(process.Id);
                        } catch (err) {
                            SPnotifyError(err);
                        } finally {
                            hideSpinner(LOADING_SPINNER);
                        }
                    }}
                    onNo={() => hideDialog(PANEL_DIALOG)}
                />
            ),
        });
    }, [userProcesses, process, locations, selectedTeam, selectedFlow]);

    const editButtons = React.useMemo(() => {
        if (editable) {
            return (
                <>
                    <ActionButton
                        iconProps={{ iconName: 'Save' }}
                        onClick={handleSave}
                    >
                        Save
                    </ActionButton>
                    <ActionButton
                        iconProps={{ iconName: 'Cancel' }}
                        onClick={() => setEditable(false)}
                    >
                        Cancel
                    </ActionButton>
                </>
            );
        }
        return (
            <ActionButton
                iconProps={{ iconName: 'Edit' }}
                onClick={() => setEditable(true)}
            >
                Edit
            </ActionButton>
        );
    }, [editable, handleSave]);

    const handleFieldChange = React.useCallback(
        (property: keyof IProcess) => (_ev: {}, value: string) => {
            if (editable) {
                setData((prev) => ({
                    ...prev,
                    [property]: value,
                }));
            }
        },
        [editable]
    );

    if (!process) return null;

    return (
        <div>
            <div className={styles.topButtonBar}>
                {editButtons}
                <ActionButton
                    iconProps={{ iconName: 'Delete' }}
                    onClick={handleDelete}
                >
                    Delete
                </ActionButton>
            </div>
            <Separator>General</Separator>
            <SystemTextField
                label="System"
                value={editable ? data.System : process.System}
                title={process.System}
                readOnly={!editable}
                onChange={handleFieldChange('System')}
            />
            <TextField
                label="Process"
                value={editable ? data.Title : process.Title}
                title={process.Title}
                readOnly={!editable}
                onChange={handleFieldChange('Title')}
            />
            <CategoryTextField
                label="Category"
                value={editable ? data.Category : process.Category}
                title={process.Category}
                readOnly={!editable}
                onChange={handleFieldChange('Category')}
            />
            <TextField
                label="Team"
                value={process.Team}
                title={process.Team}
                readOnly
                disabled={editable}
            />
            <TextField
                label="Allocation"
                value={
                    editable
                        ? data.Allocation?.toString()
                        : process.Allocation?.toString()
                }
                title={process.Allocation?.toString()}
                type="number"
                readOnly={!editable}
                onChange={handleFieldChange('Allocation')}
            />
            <UomTextField
                label="UOM"
                value={editable ? data.UOM : process.UOM}
                title={process.UOM}
                readOnly={!editable}
                onChange={handleFieldChange('UOM')}
            />

            <Separator>Manuals</Separator>
            <ManualsOverview
                processId={process.Id}
                manuals={manuals}
                onManualsChange={(manuals) =>
                    setProcess((prev) => ({
                        ...prev,
                        Manual: manuals,
                    }))
                }
            />

            {locations.length > 0 && (
                <>
                    <Separator>Locations</Separator>
                    <ActionButton
                        iconProps={{ iconName: 'Add' }}
                        onClick={() => {
                            addLocation(null, process.Id, PANEL_DIALOG);
                        }}
                    >
                        Add location
                    </ActionButton>
                    <table className={styles.locationsTable}>
                        <tr>
                            <th>Countries</th>
                            <th>Location</th>
                            <th>Done by</th>
                        </tr>
                        {locations.map((details) => (
                            <LocationDetails
                                key={details.Id}
                                location={details}
                            />
                        ))}
                    </table>
                </>
            )}

            {userProcesses.length > 0 && (
                <>
                    <Separator>Overview</Separator>
                    {
                        <UserProcessOverview
                            items={userProcesses}
                            process={process}
                        />
                    }
                </>
            )}
            <Dialog id={PANEL_DIALOG} />
        </div>
    );
};

export const ProcessDetails: React.FC<IProcessDetailsProps> = (props) => {
    const { selectedFlow, selectedTeam } = React.useContext(GlobalContext);
    const [searchParams] = useSearchParams();
    const { id } = useParams();
    const navigate = useNavigate();

    return (
        <Panel
            headerText="Process details"
            type={PanelType.medium}
            isOpen
            isLightDismiss
            onDismiss={() => {
                navigate(
                    `/team/${selectedTeam}/flow/${
                        selectedFlow.Id
                    }?${searchParams.toString()}`
                );
            }}
        >
            <Details processId={+id} />
            <LoadingSpinner id={LOADING_SPINNER_PANEL} />
        </Panel>
    );
};
