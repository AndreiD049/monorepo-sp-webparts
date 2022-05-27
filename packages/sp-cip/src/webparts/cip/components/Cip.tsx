import { Text } from 'office-ui-fabric-react';
import * as React from 'react';
import { GlobalContext } from '../utils/GlobalContext';
import styles from './Cip.module.scss';
import TasksTable from '../tasks/table/TasksTable';
import { useCipPanels } from './useCipPanels';
import { ICipWebPartProps } from '../CipWebPart';
import { IReadonlyTheme } from '@microsoft/sp-component-base';
import { useUsers } from '../users/useUsers';
import { AlertDialog } from './AlertDialog';

interface ICipProps {
    properties: ICipWebPartProps;
    theme: IReadonlyTheme;
}

const Cip: React.FC<ICipProps> = (props) => {
    const panels = useCipPanels();
    const [teams, setTeams] = React.useState<string[]>([]);
    const users = useUsers({ properties: props.properties });

    React.useEffect(() => {
        users.getTeams().then((teams) => setTeams(teams));
    }, []);

    return (
        <GlobalContext.Provider
            value={{
                properties: props.properties,
                theme: props.theme,
                teams,
            }}
        >
            <div className={styles.cip}>
                <Text variant="xxLargePlus" className={styles.header} block>
                    {props.properties.headerText}
                </Text>
                <TasksTable />
                {panels}
                <AlertDialog />
            </div>
        </GlobalContext.Provider>
    );
};

export default Cip;
