import { IFlowLocation } from '@service/process-flow';
import { uniq } from 'lodash';
import { PrimaryButton, TextField } from 'office-ui-fabric-react';
import * as React from 'react';
import {
    FooterYesNo,
    hideDialog,
    hideSpinner,
    showDialog,
    showSpinner,
} from 'sp-components';
import { MainService } from '../../services/main-service';
import {
    LOADING_SPINNER,
    MAIN_DIALOG,
} from '../../utils/constants';
import { locationsAdded } from '../../utils/events';
import { GlobalContext } from '../../utils/globalContext';
import { CountryPicker } from '../CountryPicker';
import { DoneByPicker } from '../DoneByPicker';
import styles from './LocationDialog.module.scss';

export interface ILocationDialogProps {
    editable?: boolean;
    processId?: number;
    location?: IFlowLocation;
    dialogId: string;
    operation: 'addMultiple' | 'add' | 'update';
    title?: string;
}

export const LocationDialog: React.FC<ILocationDialogProps> = (props) => {
    const { FlowLocationService, ProcessService } = MainService;
    const { selectedFlow } = React.useContext(GlobalContext);
    const [data, setData] = React.useState<Partial<IFlowLocation>>({
        DoneBy: [],
        Title: props.title || '',
        Country: [],
    });
    const [optionsDoneBy, setOptionsDoneBy] = React.useState([]);
    const [optionsCountry, setOptionsCountry] = React.useState([]);
    const [existingLocations, setExistingLocations] = React.useState<string[]>(
        []
    );

    React.useEffect(() => {
        async function run(): Promise<void> {
            setOptionsDoneBy(await FlowLocationService.getDoneByFieldChoices());
            setOptionsCountry(
                await FlowLocationService.getCountryFieldChoices()
            );
            if (props.operation !== 'update') {
                const locations = await FlowLocationService.getByFlow(
                    selectedFlow.Id
                );
                setExistingLocations(uniq(locations.map((l) => l.Title)));
            }
        }
        run().catch((err) => console.error(err));
    }, []);

    React.useEffect(() => {
        async function run(): Promise<void> {
            if (props.location !== undefined) {
                setData({
                    Title: props.location.Title,
                    DoneBy: props.location.DoneBy,
                    Country: props.location.Country,
                });
            }
        }
        run().catch((err) => console.error(err));
    }, [props.location]);

    const handleSubmit = React.useCallback(
        async (evt: React.FormEvent<HTMLElement>) => {
            try {
                showSpinner(LOADING_SPINNER);
                evt.preventDefault();
                hideDialog(props.dialogId);
                if (props.operation === 'addMultiple') {
                    // Get all current processes
                    const processes = await ProcessService.getByFlow(
                        selectedFlow.Id
                    );
                    const alreadyCreatedPId = new Set(
                        (await FlowLocationService.getByFlow(selectedFlow.Id))
                            .filter((l) => l.Title === data.Title)
                            .map((l) => l.Process.Id)
                    );
                    const missingProcesses = processes.filter(
                        (p) => !alreadyCreatedPId.has(p.Id)
                    );
                    const payloads: Omit<IFlowLocation, 'Id' | 'Process'>[] =
                        missingProcesses.map((p) => ({
                            FlowId: selectedFlow.Id,
                            ProcessId: p.Id,
                            DoneBy: data.DoneBy,
                            Title: data.Title,
                            Country: data.Country,
                        }));
                    await FlowLocationService.addFlowLocations(payloads);
                    locationsAdded();
                    return null;
                } else if (props.operation === 'update') {
                    // Update the location
                    await FlowLocationService.updateFlowLocation(
                        props.location.Id,
                        data
                    );
                } else if (props.operation === 'add') {
                    const existingLocations =
                        await FlowLocationService.getByProcess(props.processId);
                    const alreadyCreated = existingLocations.find(
                        (l) => l.Title === data.Title
                    );
                    if (alreadyCreated) {
                        await FlowLocationService.removeFlowLocation(
                            alreadyCreated.Id
                        );
                    }
                    await FlowLocationService.addFlowLocation({
                        FlowId: selectedFlow.Id,
                        ProcessId: props.processId,
                        DoneBy: data.DoneBy,
                        Title: data.Title,
                        Country: data.Country,
                    });
                }
            } finally {
                hideSpinner(LOADING_SPINNER);
            }
        },
        [selectedFlow, data, props.location]
    );

    return (
        <form
            id="newLocationDialog"
            className={styles.container}
            onSubmit={handleSubmit}
        >
            <TextField
                disabled={props.location !== undefined || Boolean(props.title)}
                required
                label="Location"
                value={data.Title}
                list="existingLocations"
                autoComplete="off"
                onChange={(_e, value) =>
                    setData((prev) => ({
                        ...prev,
                        Title: value,
                    }))
                }
            />
            <DoneByPicker
                required
                options={optionsDoneBy}
                selectedOptions={data.DoneBy}
                onSelect={(options) =>
                    setData((prev) => ({
                        ...prev,
                        DoneBy: options,
                    }))
                }
            />
            <CountryPicker
                selectedOptions={data.Country}
                required={true}
                options={optionsCountry}
                onSelect={(options) =>
                    setData((prev) => ({
                        ...prev,
                        Country: options,
                    }))
                }
            />
            <PrimaryButton
                type="submit"
                styles={{ root: { alignSelf: 'flex-start', marginTop: '1em' } }}
            >
                {props.location === undefined ? 'Create' : 'Update'}
            </PrimaryButton>
            <datalist id="existingLocations">
                {existingLocations.map((loc) => (
                    <option key={loc}>{loc}</option>
                ))}
            </datalist>
        </form>
    );
};

export function addLocations(
    title: string | undefined,
    dialogId: string = MAIN_DIALOG
): void {
    showDialog({
        id: dialogId,
        content: (
            <LocationDialog
                dialogId={dialogId}
                title={title}
                operation="addMultiple"
            />
        ),
        dialogProps: {
            modalProps: {
                isBlocking: false,
            },
            dialogContentProps: {
                title: 'Add Locations',
            },
        },
    });
}

export function addLocation(
    title: string | undefined,
    processId: number,
    dialogId: string = MAIN_DIALOG
): void {
    showDialog({
        id: dialogId,
        content: (
            <LocationDialog
                dialogId={dialogId}
                processId={processId}
                title={title}
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
}

export function editLocation(
    location: IFlowLocation,
    dialogId: string = MAIN_DIALOG
): void {
    showDialog({
        id: dialogId,
        content: (
            <LocationDialog
                dialogId={dialogId}
                location={location}
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
}

export function deleteLocation(
    location: IFlowLocation,
    dialogId: string = MAIN_DIALOG
): void {
    showDialog({
        id: dialogId,
        dialogProps: {
            modalProps: {
                isBlocking: true,
            },
            dialogContentProps: {
                title: 'Delete Location',
                subText: `Are you sure you want to delete '${location.Title}'`,
            },
        },
        footer: (
            <FooterYesNo
                onNo={() => hideDialog(dialogId)}
                onYes={async () => {
                    hideDialog(dialogId);
                    try {
                        showSpinner(LOADING_SPINNER);
                        await MainService.FlowLocationService.removeFlowLocation(
                            location.Id
                        );
                    } finally {
                        hideSpinner(LOADING_SPINNER);
                    }
                }}
            />
        ),
    });
}
