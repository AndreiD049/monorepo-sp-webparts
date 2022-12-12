import * as React from 'react';
import { IProcessFlowWebPartProps } from '../ProcessFlowWebPart';
import { IUser } from '@service/users';
import { MainService } from '../services/main-service';
import {
    GlobalContext,
    IGlobalContext,
    sentinelContext,
} from '../utils/globalContext';
import { MAIN_DIALOG, MAIN_PANEL } from '../utils/constants';
import { CommandBar } from './CommandBar';
import { Dialog, Panel } from 'sp-components';
import { Separator } from 'office-ui-fabric-react';
import { ProcessFlowContent } from './ProcessFlowContent';
import { ProcessFlowHeader } from './ProcessFlowHeader';
import { Footer } from './Footer';
import { HashRouter, Routes, Route, Outlet } from 'react-router-dom';
import styles from './ProcessFlow.module.scss';
import { ProcessDetails } from './ProcessDetails';

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
            const current = await userService.getCurrentUser();
            const teams = await userService.getTeamsChoices();
            if (!current) {
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
            const teamUsers = await userService.getUsersByTeam(team);
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
        <div className={styles.processFlow}>
            <GlobalContext.Provider value={context}>
                <HashRouter>
                    <Dialog id={MAIN_DIALOG} />
                    <Panel
                        id={MAIN_PANEL}
                        defaultProps={{
                            isFooterAtBottom: true,
                            isLightDismiss: true,
                        }}
                    />
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
                    <Routes>
                        <Route
                            path="/"
                            element={
                                <div>
                                    <ProcessFlowHeader
                                        flow={context.selectedFlow}
                                    />
                                    <ProcessFlowContent
                                        flow={context.selectedFlow}
                                    />
                                    <Outlet />
                                </div>
                            }
                        >
                            <Route
                                path="/process/:id"
                                element={<ProcessDetails />}
                            />
                        </Route>
                    </Routes>
                    <Footer config={props.properties.config} />
                </HashRouter>
            </GlobalContext.Provider>
        </div>
    );
};
