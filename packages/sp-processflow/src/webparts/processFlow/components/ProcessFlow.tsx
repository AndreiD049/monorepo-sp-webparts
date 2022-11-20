import * as React from 'react';
import { IProcessFlowWebPartProps } from '../ProcessFlowWebPart';
import { Header } from './Header';
import { IUser } from '@service/users';
import styles from './ProcessFlow.module.scss';
import { MainService } from '../services/main-service';
import { db } from '../utils/cache';
import { Text } from 'office-ui-fabric-react';
import { FlowSelector } from './FlowSelector';
import { ICustomerFlow } from '@service/process-flow';
import { GlobalContext } from '../utils/globalContext';
import { ProcessFlowTable } from './ProcessFlowTable';

export interface IProcessFlowProps {
    properties: IProcessFlowWebPartProps;
}

export const ProcessFlow: React.FC<IProcessFlowProps> = (props) => {
    const service = MainService.UserService;
    const [currentUser, setCurrentUser] = React.useState<IUser>(null);
    const [selectedTeam, setSelectedTeam] = React.useState(null);
    const [selectedFlow, setSelectedFlow] = React.useState<ICustomerFlow>(null);

    // Get current user
    React.useEffect(() => {
        async function run(): Promise<void> {
            const current = await db.getCached('current', () =>
                service.getCurrentUser()
            );
            if (!current) {
                await db.invalidateCached('current');
                console.error(`Couldn't fetch current user info`);
            }
            setCurrentUser(current);
        }
        run().catch((err) => console.error(err));
    }, []);

    if (!currentUser) return null;

    return (
        <GlobalContext.Provider value={{ currentUser }}>
            <div className={styles.processFlow}>
                <Header />
                <Text variant="medium">{currentUser.Title}</Text>
                <div>
                    <label htmlFor="team">Select team: </label>
                    <select
                        value={selectedTeam}
                        id="team"
                        onChange={(ev) => setSelectedTeam(ev.target.value)}
                    >
                        <option value="" />
                        {currentUser.ListInfo.Teams.map((team: string) => (
                            <option key={team} value={team}>
                                {team}
                            </option>
                        ))}
                    </select>
                </div>
                <FlowSelector
                    team={selectedTeam}
                    onFlowSelected={(flow) => setSelectedFlow(flow)}
                />
            </div>
            <ProcessFlowTable flow={selectedFlow} />
        </GlobalContext.Provider>
    );
};
