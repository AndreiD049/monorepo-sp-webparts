import { groupBy } from '@microsoft/sp-lodash-subset';
import { IUserProcessDetailed } from '@service/process-flow';
import { DetailsList, DetailsListLayoutMode, IColumn, IGroup, Panel, PanelType, SelectionMode } from 'office-ui-fabric-react';
import * as React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MainService } from '../../services/main-service';
import { GlobalContext } from '../../utils/globalContext';
import styles from './TeamPlannedOverview.module.scss';

export const TeamPlannedOverview: React.FC = () => {
    const { UserProcessService } = MainService;
    const { selectedTeam, selectedFlow } = React.useContext(GlobalContext);
    const [userProcesses, setUserProcesses] = React.useState<
        IUserProcessDetailed[]
    >([]);
    const navigate = useNavigate();

    React.useEffect(() => {
        async function run(): Promise<void> {
            if (!selectedTeam) return;
            const result = await UserProcessService.getByTeamAndStatus(
                selectedTeam,
                'Planned'
            );
            setUserProcesses(result.filter((i) => i.Date !== null));
        }
        run().catch((err) => console.error(err));
    }, [selectedTeam]);

    const groupped = React.useMemo(() => {
        return groupBy(userProcesses, (up) => up.Date);
    }, [userProcesses]);

    const columns: IColumn[] = React.useMemo(() => {
        return [
            {
                key: 'User',
                name: 'User',
                minWidth: 150,
                onRender: (item) => item.User.Title,
            },
            {
                key: 'Process',
                name: 'Process',
                minWidth: 150,
                onRender: (item) => item.Process.Title,
                isResizable: true,
            },
            {
                key: 'Flow',
                name: 'Flow',
                minWidth: 150,
                onRender: (item) => (<Link to={`/team/${selectedTeam}/flow/${item.FlowId}/process/${item.ProcessId}`}>{item.Flow.Title}</Link>),
                isResizable: true,
            },
        ]
    }, [selectedTeam]);

    const [tableItems, tableGroups]: [IUserProcessDetailed[], IGroup[]] = React.useMemo(() => {
        const sortedKeys = Object.keys(groupped);
        sortedKeys.sort();
        let index = 0;
        const items: IUserProcessDetailed[] = [];
        const tableGroups = sortedKeys.map((k) => {
            const startIndex = index;
            index += groupped[k].length;
            items.push(...groupped[k]);
            return {
                key: k,
                name: new Date(k).toLocaleDateString(),
                startIndex,
                count: groupped[k].length,
            };
        });
        return [items, tableGroups];
    }, [groupped]);

    const handleDismiss = React.useCallback(() => {
        navigate(`/team/${selectedTeam}/flow/${selectedFlow.Id}`);
    }, [selectedTeam, selectedFlow]);

    return (
        <Panel
            className={styles.container}
            isOpen
            type={PanelType.medium}
            headerText={`Planned overview - ${selectedTeam}`}
            isLightDismiss
            onDismiss={handleDismiss}
        >
            <DetailsList 
                groups={tableGroups}
                columns={columns}
                selectionMode={SelectionMode.none}
                layoutMode={DetailsListLayoutMode.fixedColumns}
                items={tableItems}
            />
        </Panel>
    );
};
