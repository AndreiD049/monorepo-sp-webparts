import { ICustomerFlow } from '@service/process-flow';
import { Pivot, PivotItem, PrimaryButton } from 'office-ui-fabric-react';
import * as React from 'react';
import { MainService } from '../../services/main-service';
import { GlobalContext } from '../../utils/globalContext';
import styles from './Flows.module.scss';

export interface IFlowsProps {}

const NewFlowForm: React.FC<{
    team: string;
    onFlowAdded: (id: number) => void;
}> = (props) => {
    const flowService = MainService.CustomerFlowService;
    const [customerGroups, setCustomerGroups] = React.useState([]);
    const [dbCustomersChoices, setDbCustomersChoices] = React.useState([]);
    const [name, setName] = React.useState('');
    const [group, setGroup] = React.useState('');
    const [dbCustomers, setDbCustomers] = React.useState([]);

    const handleCreate = async (): Promise<void> => {
        const added = await flowService.addFlow({
            Flow: name,
            CustomerGroup: group,
            DBCustomers: dbCustomers,
            Team: props.team,
        });
        props.onFlowAdded(added.data.Id);
    };

    React.useEffect(() => {
        async function run(): Promise<void> {
            setCustomerGroups(await flowService.getCustomerGroupChoices());
            setDbCustomersChoices(await flowService.getDBCustomerChoices());
        }
        run().catch((err) => console.error(err));
    }, []);

    return (
        <div
            style={{
                border: '1px solid black',
                margin: '5px',
                padding: '5px',
            }}
        >
            <div>
                <div>
                    <label htmlFor="flowName">Flow name: </label>
                    <input
                        style={{ display: 'block' }}
                        id="flowName"
                        value={name}
                        onChange={(ev) => setName(ev.target.value)}
                    />
                </div>
                <div style={{ marginTop: '.3em' }}>
                    <label htmlFor="customerGroups">Customer group: </label>
                    <input
                        style={{ display: 'block' }}
                        list="customerGroupsList"
                        id="customerGroups"
                        value={group}
                        onChange={(ev) => setGroup(ev.target.value)}
                    />
                    <datalist id="customerGroupsList">
                        {customerGroups.map((group) => (
                            <option key={group} value={group} />
                        ))}
                    </datalist>
                </div>
                <div style={{ marginTop: '.3em' }}>
                    <label htmlFor="dbCustomers">DB Customers: </label>
                    <select
                        onChange={(ev) =>
                            setDbCustomers(
                                Array.from(ev.target.selectedOptions).map(
                                    (o) => o.value
                                )
                            )
                        }
                        style={{ display: 'block' }}
                        id="dbCustomers"
                        multiple
                    >
                        {dbCustomersChoices.map((c) => (
                            <option key={c} value={c}>
                                {c}
                            </option>
                        ))}
                    </select>
                    <button
                        onClick={async () => {
                            const newGroup = prompt('Enter new customer group');
                            await flowService.addDBCustomer([newGroup]);
                            setDbCustomersChoices((prev) => [
                                ...prev,
                                newGroup,
                            ]);
                        }}
                    >
                        +
                    </button>
                </div>
            </div>
            <button onClick={handleCreate}>Create</button>
        </div>
    );
};

export const Flows: React.FC<IFlowsProps> = (props) => {
    const flowService = MainService.CustomerFlowService;
    const { selectedTeam } = React.useContext(GlobalContext);
    const [flows, setFlows] = React.useState<ICustomerFlow[]>([]);
    const [showNewForm, setShowNewForm] = React.useState(false);

    React.useEffect(() => {
        async function run(): Promise<void> {
            if (selectedTeam) {
                const result = await flowService.getByTeam(selectedTeam);
                if (result) setFlows(result);
            }
        }
        run().catch((err) => console.error(err));
    }, [selectedTeam]);

    if (!selectedTeam) {
        return null;
    }

    let newForm: JSX.Element = null;
    if (showNewForm) {
        newForm = (
            <NewFlowForm
                team={selectedTeam}
                onFlowAdded={async (id: number) => {
                    const newFlow = await flowService.getById(id);
                    setFlows((prev) => [...prev, newFlow]);
                    setShowNewForm(false);
                }}
            />
        );
    }

    return (
        <div className={styles.container}>
            <Pivot>
                {flows.map((flow) => (
                    <PivotItem headerText={flow.Flow} itemKey={flow.Id.toString()}>test</PivotItem>
                ))}
            </Pivot>
        </div>
    );
};
