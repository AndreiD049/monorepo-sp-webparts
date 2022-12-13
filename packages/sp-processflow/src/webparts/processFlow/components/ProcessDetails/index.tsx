import { groupBy } from '@microsoft/sp-lodash-subset';
import { IFlowLocation, IProcess, IUserProcess } from '@service/process-flow';
import { Dictionary } from 'lodash';
import {
    ActionButton,
    IconButton,
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
    hidePanel,
    showDialog,
    showPanel,
} from 'sp-components';
import { MainService } from '../../services/main-service';
import { MAIN_PANEL, PANEL_DIALOG } from '../../utils/constants';
import {
    listenLocationAdded,
    listenLocationDeleted,
    listenLocationUpdated,
} from '../../utils/events';
import { LocationDialog } from '../LocationDialog';
import { SystemTextField } from '../SystemTextField';
import styles from './ProcessDetails.module.scss';

export interface IProcessDetailsProps {
    // Props go here
}

const LocationDetails: React.FC<{ location: IFlowLocation }> = (props) => {
    const { FlowLocationService } = MainService;
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
                        showDialog({
                            id: PANEL_DIALOG,
                            content: (
                                <LocationDialog
                                    dialogId={PANEL_DIALOG}
                                    location={props.location}
                                    operation="update"
                                />
                            ),
                            dialogProps: {
                                modalProps: {
                                    isBlocking: false,
                                },
                                dialogContentProps: {
                                    title: 'Edit Location',
                                },
                            },
                        });
                    }}
                />
                <IconButton
                    style={{ marginLeft: '4px' }}
                    iconProps={{ iconName: 'Delete' }}
                    onClick={() => {
                        showDialog({
                            id: PANEL_DIALOG,
                            dialogProps: {
                                dialogContentProps: {
                                    title: 'Delete Location',
                                    subText: `Are you sure you want to delete '${props.location.Title}'`,
                                },
                            },
                            footer: (
                                <FooterYesNo
                                    onNo={() => hideDialog(PANEL_DIALOG)}
                                    onYes={async () => {
                                        await FlowLocationService.removeFlowLocation(
                                            props.location.Id
                                        );
                                        hideDialog(PANEL_DIALOG);
                                    }}
                                />
                            ),
                        });
                    }}
                />
            </td>
        </tr>
    );
};

const StatusTable: React.FC<{
    groupped: Dictionary<IUserProcess[]>;
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
                        <td>{new Date(i.Date).toLocaleDateString()}</td>
                    </tr>
                ))}
        </>
    );
};

const UserProcessOverview: React.FC<{ items: IUserProcess[] }> = (props) => {
    const groupped = React.useMemo(() => {
        return groupBy(props.items, (i) => i.Status);
    }, [props.items]);

    return (
        <div>
            <table className={styles.overviewTable}>
                <tbody>
                    <StatusTable groupped={groupped} status="Planned" />
                    <StatusTable groupped={groupped} status="On-going" />
                    <StatusTable groupped={groupped} status="Completed" />
                </tbody>
            </table>
        </div>
    );
};

const Details: React.FC<{ processId: number }> = (props) => {
    const { ProcessService, FlowLocationService, UserProcessService } =
        MainService;
    const [process, setProcess] = React.useState<IProcess>(null);
    const [locations, setLocations] = React.useState<IFlowLocation[]>([]);
    const [userProcesses, setUserProcesses] = React.useState<IUserProcess[]>(
        []
    );
    const [editable, setEditable] = React.useState(false);
    const [data, setData] = React.useState<Partial<IProcess>>({});

    React.useEffect(() => {
        if (editable) {
            setData({
                System: process.System,
                Title: process.Title,
                Category: process.Category,
                Manual: process.Manual,
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
        async function locationDeleteHandler(data: number): Promise<void> {
            setLocations((prev) => prev.filter((l) => l.Id !== data));
        }
        const removeLocationAdd = listenLocationAdded(locationAddedHandler);
        const removeLocationUpd = listenLocationUpdated(locationUpdatedHandler);
        const removeLocationDel = listenLocationDeleted(locationDeleteHandler);
        return () => {
            removeLocationAdd();
            removeLocationUpd();
            removeLocationDel();
        };
    }, [locations]);

    const editButtons = React.useMemo(() => {
        if (editable) {
            return (
                <>
                    <ActionButton iconProps={{ iconName: 'Save' }}>
                        Save
                    </ActionButton>
                    <ActionButton iconProps={{ iconName: 'Cancel' }} onClick={() => setEditable(false)}>
                        Cancel
                    </ActionButton>
                </>
            );
        }
        return (
            <ActionButton iconProps={{ iconName: 'Edit' }} onClick={() => setEditable(true)}>Edit</ActionButton>
        );
    }, [editable]);

    if (!process) return null;

    return (
        <div>
            <div className={styles.topButtonBar}>
                <ActionButton
                    iconProps={{ iconName: 'Add' }}
                    onClick={() => {
                        showDialog({
                            id: PANEL_DIALOG,
                            content: (
                                <LocationDialog
                                    dialogId={PANEL_DIALOG}
                                    processId={props.processId}
                                    operation="add"
                                />
                            ),
                            dialogProps: {
                                modalProps: {
                                    isBlocking: false,
                                },
                                dialogContentProps: {
                                    title: 'Add Location',
                                },
                            },
                        });
                    }}
                >
                    Add location
                </ActionButton>
                {editButtons}
            </div>
            <Separator>General</Separator>
            <SystemTextField 
                label="System"
                value={editable ? data.System : process.System}
                title={process.System}
                readOnly={!editable}
                onChange={(_ev, value) => {
                    if (editable) {
                        setData((prev) => ({
                            ...prev,
                            System: value,
                        }));
                    }
                }}
            />
            <TextField
                label="Process"
                value={process.Title}
                title={process.Title}
                readOnly
            />
            <TextField
                label="Category"
                value={process.Category}
                title={process.Category}
                readOnly
            />
            <TextField
                label="Team"
                value={process.Team}
                title={process.Team}
                readOnly
            />
            <TextField
                label="Manual"
                value={process.Manual}
                title={process.Manual}
                readOnly
            />
            <TextField
                label="Allocation"
                value={process.Allocation?.toString()}
                title={process.Allocation?.toString()}
                readOnly
            />
            <TextField
                label="UOM"
                value={process.UOM}
                title={process.UOM}
                readOnly
            />
            {locations.length > 0 && (
                <>
                    <Separator>Locations</Separator>
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
                    {<UserProcessOverview items={userProcesses} />}
                </>
            )}
            <Dialog id={PANEL_DIALOG} />
        </div>
    );
};

export const ProcessDetails: React.FC<IProcessDetailsProps> = (props) => {
    const [searchParams] = useSearchParams();
    const { id } = useParams();
    const navigate = useNavigate();

    React.useEffect(() => {
        showPanel(
            MAIN_PANEL,
            {
                headerText: 'Process details',
                type: PanelType.medium,
                onDismiss: () => {
                    navigate(`/?${searchParams.toString()}`);
                    hidePanel(MAIN_PANEL);
                },
            },
            <Details processId={+id} />
        );
    }, [id]);

    return null;
};
