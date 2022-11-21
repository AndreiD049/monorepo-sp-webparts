import { ICustomerFlow } from '@service/process-flow';
import { Pivot, PivotItem } from 'office-ui-fabric-react';
import * as React from 'react';
import { MainService } from '../../services/main-service';
import { FLOW_ADDED, FLOW_UPDATED } from '../../utils/constants';
import { GlobalContext } from '../../utils/globalContext';
import { ProcessFlowContent } from '../ProcessFlowContent';
import styles from './Flows.module.scss';

export interface IFlowsProps {
    onFlowSelected?: (flow: ICustomerFlow) => void;
}

export const Flows: React.FC<IFlowsProps> = (props) => {
    const flowService = MainService.CustomerFlowService;
    const { selectedTeam } = React.useContext(GlobalContext);
    const [flows, setFlows] = React.useState<ICustomerFlow[]>([]);
    const [selectedFlow, setSelectedFlow] = React.useState<ICustomerFlow>(null);

    React.useEffect(() => {
        async function run(): Promise<void> {
            if (selectedTeam) {
                const result = await flowService.getByTeam(selectedTeam);
                if (result) {
                    setFlows(result);
                    setSelectedFlow(result[0]);
                }
            }
        }
        run().catch((err) => console.error(err));
    }, [selectedTeam]);

    React.useEffect(() => {
        async function handlerAdded(ev: CustomEvent<{ id: number }>): Promise<void> {
            const id = ev.detail.id;
            const newFlow = await flowService.getById(id);
            setFlows((prev) => [...prev, newFlow]);
        }
        async function handlerUpdated(ev: CustomEvent<{ id: number }>): Promise<void> {
            const id = ev.detail.id;
            const newFlow = await flowService.getById(id);
            setFlows((prev) => [...prev.map((f) => f.Id === id ? newFlow : f)]);
        }
        document.addEventListener(FLOW_ADDED, handlerAdded);
        document.addEventListener(FLOW_UPDATED, handlerUpdated);
        return () => {
            document.removeEventListener(FLOW_ADDED, handlerAdded);
            document.removeEventListener(FLOW_UPDATED, handlerUpdated);
        };
    }, []);

    React.useEffect(() => {
        setSelectedFlow((prev) => flows.find((f) => f.Id === prev?.Id));
    }, [flows]);

    React.useEffect(() => {
        if (props.onFlowSelected && selectedFlow) {
            props.onFlowSelected(selectedFlow);
        }
    }, [selectedFlow]);

    if (!selectedTeam) {
        return null;
    }
    return (
        <div className={styles.container}>
            <Pivot
                selectedKey={selectedFlow?.Id.toString()}
                onLinkClick={(item) => setSelectedFlow(flows.find((f) => f.Id === +item.props.itemKey))}
                styles={{
                    root: {
                        display: 'flex',
                        flowFlow: 'row nowrap',
                        alignItems: 'center',
                        justifyContent: 'center',
                    },
                }}
            >
                {flows.map((flow) => (
                    <PivotItem
                        key={flow.Id}
                        headerText={flow.Flow}
                        itemKey={flow.Id.toString()}
                    >
                        <ProcessFlowContent flow={selectedFlow} />
                    </PivotItem>
                ))}
            </Pivot>
        </div>
    );
};
