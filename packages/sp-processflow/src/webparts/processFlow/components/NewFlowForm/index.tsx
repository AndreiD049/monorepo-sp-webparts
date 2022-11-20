import * as React from 'react';
import { MainService } from '../../services/main-service';
import styles from './NewFlowForm.module.scss';

export interface INewFlowFormProps {
    // Props go here
}

export const NewFlowForm: React.FC<INewFlowFormProps> = (props) => {
    const { CustomerFlowService } = MainService;
    const [choiceDBCustomers, setChoiceDBCustomers] = React.useState([]);
    const [choiceCustomerGroups, setChoiceCustomerGroups] = React.useState([]);

    // Fetch choice fields
    React.useEffect(() => {
        async function run(): Promise<void> {
            setChoiceDBCustomers(await CustomerFlowService.getDBCustomerChoices());
            setChoiceCustomerGroups(await CustomerFlowService.getCustomerGroupChoices());
        }
        run().catch((err) => console.error(err));
    }, []);

    return (
        <div className={styles.container}>NewFlowForm</div>
    );
};
