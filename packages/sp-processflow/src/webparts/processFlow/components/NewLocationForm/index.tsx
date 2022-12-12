import { IFlowLocation } from '@service/process-flow';
import {
    ComboBox,
    IComboBoxOption,
    PrimaryButton,
    TextField,
} from 'office-ui-fabric-react';
import * as React from 'react';
import { hideDialog } from 'sp-components';
import { MainService } from '../../services/main-service';
import { MAIN_DIALOG } from '../../utils/constants';
import { locationsAdded } from '../../utils/events';
import { GlobalContext } from '../../utils/globalContext';
import { DoneByPicker } from '../DoneByPicker';
import styles from './NewLocationForm.module.scss';

export interface INewLocationFormProps {
    editable?: boolean;
    processId?: number;
}

export const NewLocationForm: React.FC<INewLocationFormProps> = (props) => {
    const { FlowLocationService, ProcessService } = MainService;
    const { selectedFlow } = React.useContext(GlobalContext);
    const [data, setData] = React.useState<Partial<IFlowLocation>>({
        DoneBy: [],
        Title: '',
        Country: [],
    });
    const [optionsDoneBy, setOptionsDoneBy] = React.useState([]);
    const [optionsCountry, setOptionsCountry] = React.useState([]);

    const countryOptions: IComboBoxOption[] = React.useMemo(() => {
        return optionsCountry.map((country) => ({
            key: country,
            text: country,
        }));
    }, [optionsCountry]);

    React.useEffect(() => {
        async function run(): Promise<void> {
            setOptionsDoneBy(await FlowLocationService.getDoneByFieldChoices());
            setOptionsCountry(
                await FlowLocationService.getCountryFieldChoices()
            );
        }
        run().catch((err) => console.error(err));
    }, []);

    const handleSubmit = React.useCallback(
        async (evt: React.FormEvent<HTMLElement>) => {
            evt.preventDefault();
            hideDialog(MAIN_DIALOG);
            // Get all current processes
            const processes = await ProcessService.getByFlow(selectedFlow.Id);
            const payloads: Omit<IFlowLocation, 'Id' | 'Process'>[] =
                processes.map((p) => ({
                    FlowId: selectedFlow.Id,
                    ProcessId: p.Id,
                    DoneBy: data.DoneBy,
                    Title: data.Title,
                    Country: data.Country,
                }));
            await FlowLocationService.addFlowLocations(payloads);
            locationsAdded();
            return null;
        },
        [selectedFlow, data]
    );

    return (
        <form
            id="newLocationDialog"
            className={styles.container}
            onSubmit={handleSubmit}
        >
            <TextField
                required
                label="Location"
                value={data.Title}
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
            <ComboBox
                label="Country"
                options={countryOptions}
                selectedKey={data.Country[0]}
                calloutProps={{
                    calloutMaxHeight: 400,
                }}
                onChange={(ev, option) =>
                    setData((prev) => {
                        return {
                            ...prev,
                            Country: [option.key.toString()],
                        };
                    })
                }
            />
            <PrimaryButton
                type="submit"
                styles={{ root: { alignSelf: 'flex-start', marginTop: '1em' } }}
            >
                Create
            </PrimaryButton>
        </form>
    );
};
