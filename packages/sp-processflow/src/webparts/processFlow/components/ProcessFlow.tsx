import * as React from 'react';
import { IProcessFlowWebPartProps } from '../ProcessFlowWebPart';
import { IUser } from '@service/users';
import { MainService } from '../services/main-service';
import { db } from '../utils/cache';
import {
    GlobalContext,
    IGlobalContext,
    sentinelContext,
} from '../utils/globalContext';
import {
    CURRENT_USER,
    HOUR,
    MAIN_DIALOG,
    TEAMS_CHOICES,
    TEAM_USERS,
} from '../utils/constants';
import { CommandBar } from './CommandBar';
import { Dialog } from 'sp-components';
import { Separator } from 'office-ui-fabric-react';
import { ProcessFlowContent } from './ProcessFlowContent';
import { ProcessFlowHeader } from './ProcessFlowHeader';
import styles from './ProcessFlow.module.scss';
import { Footer } from './Footer';

export interface IProcessFlowProps {
    properties: IProcessFlowWebPartProps;
}

export const ProcessFlow: React.FC<IProcessFlowProps> = (props) => {
    const userService = MainService.UserService;
    const [currentUser, setCurrentUser] = React.useState<IUser>(null);
    const [context, setContext] =
        React.useState<IGlobalContext>(sentinelContext);

    // Get current user
    React.useEffect(() => {
        async function run(): Promise<void> {
            const current = await db.getCached(CURRENT_USER, () =>
                userService.getCurrentUser()
            );
            const teams = await db.getCached(
                TEAMS_CHOICES,
                () => userService.getTeamsChoices(),
                HOUR
            );
            if (!current) {
                await db.invalidateCached('current');
                console.error(`Couldn't fetch current user info`);
            }
            setCurrentUser(current);
            // Update context
            setContext((prev) => ({
                ...prev,
                teams,
                currentUser: current,
            }));
        }
        run().catch((err) => console.error(err));
    }, []);

    const handleTeamSelected = React.useCallback(
        async (team: string) => {
            const teamUsers = await db.getCached(TEAM_USERS(team), () =>
                userService.getUsersByTeam(team)
            );
            setContext((prev) => ({
                ...prev,
                selectedTeam: team,
                teamUsers,
            }));
        },
        [userService]
    );

    if (!currentUser) return null;

    return (
        <GlobalContext.Provider value={context}>
            <div className={styles.processFlow}>
                <CommandBar
                    onTeamSelected={handleTeamSelected}
                    onFlowSelected={(flow) => {
                        setContext((prev) => ({
                            ...prev,
                            selectedFlow: flow,
                        }));
                    }}
                />
                <Separator />
                <ProcessFlowHeader flow={context.selectedFlow} />
                <ProcessFlowContent flow={context.selectedFlow} />
                <Footer config={props.properties.config} />
            </div>
            <Dialog id={MAIN_DIALOG} />
        </GlobalContext.Provider>
    );
};
