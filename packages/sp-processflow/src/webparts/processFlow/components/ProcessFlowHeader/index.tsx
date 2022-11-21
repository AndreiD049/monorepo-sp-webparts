import { ICustomerFlow } from '@service/process-flow';
import { IconButton } from 'office-ui-fabric-react';
import * as React from 'react';
import { MainService } from '../../services/main-service';
import { CustomerGroupPicker } from '../CustomerGroupPicker';
import { DBCustomersPicker } from '../DBCustomersPicker';
import { flowUpdated } from '../NewFlowForm';
import styles from './ProcessFlowHeader.module.scss';

export interface IProcessFlowHeaderProps {
    flow: ICustomerFlow;
}

export const ProcessFlowHeader: React.FC<IProcessFlowHeaderProps> = (props) => {
    const { CustomerFlowService } = MainService;
    const [editable, setEditable] = React.useState(false);
    const [selectedCustomerGroup, setSelectedCustomerGroup] = React.useState(props.flow.CustomerGroup);
    const [selectedDbCustomers, setSelectedDbCustomers] = React.useState(props.flow.DBCustomers || []);
    const [choiceCustomerGroup, setChoiceCustomerGroup] = React.useState([]);
    const [choiceDbCustomers, setChoiceDBCustomers] = React.useState([]);

    React.useEffect(() => {
        setEditable(false);
        setSelectedCustomerGroup(props.flow.CustomerGroup);
        setSelectedDbCustomers(props.flow.DBCustomers);
    }, [props.flow]);
    
    React.useEffect(() => {
        async function run(): Promise<void> {
            if (editable && choiceCustomerGroup.length === 0) {
                setChoiceCustomerGroup(await CustomerFlowService.getCustomerGroupChoices());
                setChoiceDBCustomers(await CustomerFlowService.getDBCustomerChoices());
            }
        }
        run().catch((err) => console.error(err));
    }, [editable]);

    const handleClickEditSave = React.useCallback(async () => {
        if (!editable) {
            setEditable(true);
        } else {
            await CustomerFlowService.updateFlow(props.flow.Id, {
                CustomerGroup: selectedCustomerGroup,
                DBCustomers: selectedDbCustomers,
            });
            flowUpdated(props.flow.Id);
            setEditable(false);
        }
    }, [editable, selectedCustomerGroup, selectedDbCustomers]);

    if (!props.flow) return null;

    return (
        <div className={styles.container}>
            <CustomerGroupPicker
                options={editable ? choiceCustomerGroup : [props.flow.CustomerGroup]}
                selectedOption={selectedCustomerGroup}
                onSelect={(group) => setSelectedCustomerGroup(group)}
                disabled={!editable}
                style={{
                    display: 'inline-block',
                    minWidth: 180,
                }}
            />
            <DBCustomersPicker
                options={editable ? choiceDbCustomers : props.flow.DBCustomers || []}
                selectedOptions={selectedDbCustomers}
                onSelect={(items) => setSelectedDbCustomers(items)}
                disabled={!editable}
                style={{
                    display: 'inline-block',
                    minWidth: 180,
                }}
            />
            <IconButton
                onClick={handleClickEditSave}
                iconProps={{ iconName: editable ? 'Save' : 'Edit' }}
            />
            {editable && <IconButton onClick={() => setEditable(false)} iconProps={{ iconName: 'Cancel' }} />}
        </div>
    );
};
