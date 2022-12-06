import { ICustomerFlow } from '@service/process-flow';
import {
    ActionButton,
    ComboBox,
    IComboBoxOption,
    IComboBoxStyles,
    PanelType,
} from 'office-ui-fabric-react';
import * as React from 'react';
import {
    dispatchButtonClick,
    FooterOkCancel,
    hidePanel,
    showDialog,
    showPanel,
} from 'sp-components';
import { MainService } from '../../services/main-service';
import { MAIN_DIALOG, MAIN_PANEL, MAIN_PANEL_FORM } from '../../utils/constants';
import { GlobalContext } from '../../utils/globalContext';
import { NewFlowForm } from '../NewFlowForm';
import { NewProcesses } from '../NewProcesses';
import styles from './CommandBar.module.scss';

export interface ICommandBarProps {
    onTeamSelected: (team: string) => void;
    onFlowSelected: (flow: ICustomerFlow) => void;
}

const comboBoxStyles: Partial<IComboBoxStyles> = {
    root: {
        maxWidth: 300,
    },
};

export const CommandBar: React.FC<ICommandBarProps> = (props) => {
    const flowService = MainService.CustomerFlowService;
    const { teams, selectedTeam, selectedFlow } =
        React.useContext(GlobalContext);
    const [flows, setFlows] = React.useState<ICustomerFlow[]>([]);

    React.useEffect(() => {
        async function run(): Promise<void> {
            if (selectedTeam) {
                const result = await flowService.getByTeam(selectedTeam);
                if (result) {
                    setFlows(result);
                    props.onFlowSelected(result[0]);
                }
            }
        }
        run().catch((err) => console.error(err));
    }, [selectedTeam]);

    const teamOptions: IComboBoxOption[] = React.useMemo(
        () =>
            teams.map((team) => ({
                key: team,
                text: team,
            })),
        [teams]
    );

    const flowOptions: IComboBoxOption[] = React.useMemo(
        () =>
            flows.map((flow) => ({
                key: flow.Flow,
                text: flow.Flow,
                data: flow,
            })),
        [flows]
    );

    const handleNewFlow = React.useCallback(() => {
        showDialog({
            id: MAIN_DIALOG,
            dialogProps: {
                title: 'New flow',
                isBlocking: false,
            },
            content: (
                <NewFlowForm
                    onFlowAdded={async (flowId) => {
                        const flow = await flowService.getById(flowId);
                        setFlows((prev) => [...prev, flow]);
                        if (!selectedFlow) {
                            props.onFlowSelected(flow);
                        }
                    }}
                />
            ),
        });
    }, [selectedTeam]);

    const handleNewProcess = React.useCallback(() => {
        showPanel(
            MAIN_PANEL,
            {
                headerText: 'Add new processes',
                type: PanelType.large,
                onRenderFooter: () => (
                    <div style={{ padding: '.5em' }}>
                        <FooterOkCancel
                            onOk={() => null}
                            onCancel={() => hidePanel(MAIN_PANEL)}
                            form={MAIN_PANEL_FORM}
                        />
                    </div>
                ),
            },
            <NewProcesses />
        );
    }, [selectedFlow, selectedTeam]);

    return (
        <div className={styles.container}>
            <ComboBox
                label="Team"
                options={teamOptions}
                onChange={(_ev, option) =>
                    props.onTeamSelected(option.key.toString())
                }
                selectedKey={selectedTeam}
                styles={comboBoxStyles}
            />
            <ComboBox
                label="Flow"
                options={flowOptions}
                onChange={(_ev, option) => props.onFlowSelected(option.data)}
                selectedKey={selectedFlow?.Flow}
                styles={comboBoxStyles}
            />
            {/* {selectedFlow && <ProcessFlowHeader flow={selectedFlow} />} */}
            <ActionButton
                onClick={handleNewFlow}
                disabled={!Boolean(selectedTeam)}
                iconProps={{ iconName: 'Add' }}
                styles={{ root: { maxHeight: 32 } }}
            >
                Add flow
            </ActionButton>
            <ActionButton
                onClick={handleNewProcess}
                disabled={!Boolean(selectedFlow)}
                iconProps={{ iconName: 'Add' }}
                styles={{ root: { maxHeight: 32 } }}
            >
                Add Process(es)
            </ActionButton>
        </div>
    );
};
