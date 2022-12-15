import { ICustomerFlow } from '@service/process-flow';
import {
    ActionButton,
    ComboBox,
    IComboBoxOption,
    IComboBoxStyles,
    IContextualMenuProps,
    PanelType,
    SearchBox,
} from 'office-ui-fabric-react';
import * as React from 'react';
import { useSearchParams } from 'react-router-dom';
import {
    FooterOkCancel,
    hidePanel,
    showDialog,
    showPanel,
} from 'sp-components';
import { MainService } from '../../services/main-service';
import {
    DB_NAME,
    MAIN_DIALOG,
    MAIN_PANEL,
    MAIN_PANEL_FORM,
    STORE_NAME,
} from '../../utils/constants';
import { GlobalContext } from '../../utils/globalContext';
import { NewFlowForm } from '../NewFlowForm';
import { LocationDialog } from '../LocationDialog';
import { NewProcesses } from '../NewProcesses';
import { openDatabase, removeCached } from 'idb-proxy';
import styles from './CommandBar.module.scss';
import { debounce } from '@microsoft/sp-lodash-subset';

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
    const [searchParams, setSearchParams] = useSearchParams();
    const [refreshed, setRefreshed] = React.useState(false);

    const handleFlowSelected = React.useCallback(
        (flow: ICustomerFlow) => {
            props.onFlowSelected(flow);
            setSearchParams((prev) => ({
                flow: flow?.Id.toString(),
                team: prev.get('team'),
                search: '',
            }));
        },
        [selectedTeam]
    );

    const handleTeamSelected = React.useCallback(
        (team: string) => {
            props.onTeamSelected(team);
            setSearchParams((prev) => {
                return {
                    flow: prev.get('flow'),
                    team,
                    search: '',
                };
            });
        },
        [selectedFlow]
    );

    React.useEffect(() => {
        async function run(): Promise<void> {
            if (selectedTeam) {
                const result = await flowService.getByTeam(selectedTeam);
                if (result) {
                    setFlows(result);
                    const urlFlow = +searchParams.get('flow');
                    let selectedFlow = result[0];
                    if (urlFlow && Number.isInteger(urlFlow)) {
                        const foundFlow = result.find((f) => f.Id === urlFlow);
                        selectedFlow = foundFlow || result[0];
                    }
                    handleFlowSelected(selectedFlow);
                }
            } else {
                const urlTeam = searchParams.get('team');
                if (urlTeam && teams.indexOf(urlTeam) !== -1) {
                    handleTeamSelected(urlTeam);
                }
            }
        }
        run().catch((err) => console.error(err));
    }, [selectedTeam, teams]);

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
                key: flow.Title,
                text: flow.Title,
                data: flow,
            })),
        [flows]
    );

    const handleNewFlow = React.useCallback(() => {
        showDialog({
            id: MAIN_DIALOG,
            dialogProps: {
                title: 'New flow',
                isBlocking: true,
            },
            content: (
                <NewFlowForm
                    onFlowAdded={async (flowId) => {
                        const flow = await flowService.getById(flowId);
                        setFlows((prev) => [...prev, flow]);
                        if (!selectedFlow) {
                            handleFlowSelected(flow);
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
                isLightDismiss: false,
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

    const handleNewLocation = React.useCallback(() => {
        showDialog({
            id: MAIN_DIALOG,
            dialogProps: {
                title: 'New location',
                isBlocking: true,
            },
            content: (
                <LocationDialog
                    dialogId={MAIN_DIALOG}
                    operation="addMultiple"
                />
            ),
        });
    }, []);

    const handleRefresh = React.useCallback(async () => {
        const db = await openDatabase(DB_NAME, STORE_NAME);
        await removeCached(db, /.*/);
        props.onFlowSelected({ ...selectedFlow });
        setRefreshed(true);
    }, [selectedFlow]);

    const menuProps: IContextualMenuProps = React.useMemo(
        () => ({
            items: [
                {
                    key: 'flow',
                    text: 'Add flow',
                    onClick: handleNewFlow,
                    iconProps: {
                        iconName: 'Dataflows',
                    },
                },
                {
                    key: 'process',
                    text: 'Add process(es)',
                    onClick: handleNewProcess,
                    iconProps: {
                        iconName: 'Processing',
                    },
                },
                {
                    key: 'location',
                    text: 'Add location',
                    onClick: handleNewLocation,
                    iconProps: {
                        iconName: 'CityNext',
                    },
                },
            ],
        }),
        []
    );

    return (
        <div className={styles.container}>
            <div className={styles.nearItems}>
                <ComboBox
                    label="Team"
                    options={teamOptions}
                    onChange={(_ev, option) =>
                        handleTeamSelected(option.key.toString())
                    }
                    selectedKey={selectedTeam}
                    styles={comboBoxStyles}
                    useComboBoxAsMenuWidth
                />
                <ComboBox
                    label="Flow"
                    options={flowOptions}
                    onChange={(_ev, option) => handleFlowSelected(option.data)}
                    selectedKey={selectedFlow?.Title}
                    styles={comboBoxStyles}
                    useComboBoxAsMenuWidth
                />
                {/* {selectedFlow && <ProcessFlowHeader flow={selectedFlow} />} */}
                <ActionButton
                    disabled={!Boolean(selectedTeam)}
                    iconProps={{ iconName: 'Add' }}
                    styles={{ root: { maxHeight: 32 } }}
                    menuProps={menuProps}
                >
                    Add
                </ActionButton>
            </div>
            <div className={styles.farItems}>
                <ActionButton
                    iconProps={{ iconName: 'Refresh' }}
                    styles={{ root: { maxHeight: 32 } }}
                    onClick={handleRefresh}
                    disabled={refreshed}
                >
                    Refresh
                </ActionButton>
                <SearchBox
                    placeholder="Search..."
                    value={searchParams.get('search') || ''}
                    onChange={debounce((_ev, newValue) => {
                        setSearchParams((prev) => {
                            prev.set('search', newValue);
                            return prev;
                        });
                    }, 500)}
                />
            </div>
        </div>
    );
};
