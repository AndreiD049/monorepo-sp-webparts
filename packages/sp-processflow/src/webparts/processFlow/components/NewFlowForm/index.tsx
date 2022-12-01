import { ICustomerFlow } from '@service/process-flow';
import { PrimaryButton, Stack, TextField } from 'office-ui-fabric-react';
import * as React from 'react';
import { hideDialog } from 'sp-components';
import { MainService } from '../../services/main-service';
import { MAIN_DIALOG } from '../../utils/constants';
import { GlobalContext } from '../../utils/globalContext';
import { CustomerGroupPicker } from '../CustomerGroupPicker';
import { DBCustomersPicker } from '../DBCustomersPicker';
import styles from './NewFlowForm.module.scss';

export interface INewFlowFormProps {
    onFlowAdded?: (id: number) => void;
    onFlowUpdated?: (id: number) => void;
}

export const NewFlowForm: React.FC<INewFlowFormProps> = (props) => {
    const { selectedTeam } = React.useContext(GlobalContext);
    const { CustomerFlowService } = MainService;
    const [choiceDBCustomers, setChoiceDBCustomers] = React.useState([]);
    const [choiceCustomerGroups, setChoiceCustomerGroups] = React.useState([]);
    const [payload, setPayload] = React.useState({
        CustomerGroup: '',
        DBCustomers: [],
        Team: selectedTeam,
        Flow: '',
    });

    // Fetch choice fields
    React.useEffect(() => {
        async function run(): Promise<void> {
            setChoiceDBCustomers(
                await CustomerFlowService.getDBCustomerChoices()
            );
            setChoiceCustomerGroups(
                await CustomerFlowService.getCustomerGroupChoices()
            );
        }
        run().catch((err) => console.error(err));
    }, []);

    const handleCreate = React.useCallback(async (body: Omit<ICustomerFlow, 'Id'>) => {
        const added = await CustomerFlowService.addFlow(body);
        if (props.onFlowAdded) props.onFlowAdded(added.data.Id);
        hideDialog(MAIN_DIALOG);
    }, []);

    return (
        <div className={styles.container}>
            <Stack verticalAlign="center" horizontalAlign="stretch">
                <TextField
                    label="Flow"
                    value={payload.Flow}
                    onChange={(_ev, value) =>
                        setPayload((prev) => ({
                            ...prev,
                            Flow: value,
                        }))
                    }
                />
                <CustomerGroupPicker
                    options={choiceCustomerGroups}
                    onSelect={(group) =>
                        setPayload((prev) => ({
                            ...prev,
                            CustomerGroup: group,
                        }))
                    }
                />
                <DBCustomersPicker
                    options={choiceDBCustomers}
                    onSelect={(dbCustomers) =>
                        setPayload((prev) => ({
                            ...prev,
                            DBCustomers: dbCustomers,
                        }))
                    }
                />
                <PrimaryButton style={{ marginTop: '.5em' }} onClick={() => handleCreate(payload)}>Create</PrimaryButton>
            </Stack>
        </div>
    );
};
