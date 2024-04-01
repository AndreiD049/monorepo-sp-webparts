import * as React from 'react';
import { IProcessFlowWebPartProps } from '../ProcessFlowWebPart';
import { IUser } from '@service/users';
import { MainService } from '../services/main-service';
import {
	GlobalContext,
	IGlobalContext,
	sentinelContext,
} from '../utils/globalContext';
import { MAIN_CALLOUT, LOADING_SPINNER, MAIN_DIALOG, MAIN_PANEL, PANEL_MANUALS } from '../utils/constants';
import { CommandBar } from './CommandBar';
import { Callout, Dialog, Footer, LoadingSpinner, Panel } from 'sp-components';
import { PanelType, Separator } from '@fluentui/react';
import { ProcessFlowContent } from './ProcessFlowContent';
import { ProcessFlowHeader } from './ProcessFlowHeader';
import { HashRouter, Routes, Route, Outlet } from 'react-router-dom';
import styles from './ProcessFlow.module.scss';
import { ProcessDetails } from './ProcessDetails';
import { TeamPlannedOverview } from './TeamPlannedOverview';

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
					<Callout id={MAIN_CALLOUT} />
					<Dialog id={MAIN_DIALOG} />
					<Panel
						id={MAIN_PANEL}
						defaultProps={{
							isFooterAtBottom: true,
							isLightDismiss: true,
						}}
					/>
					<Panel
						id={PANEL_MANUALS}
						defaultProps={{
							type: PanelType.customNear,
							customWidth: '70vw',
						}}
					/>
					<LoadingSpinner id={LOADING_SPINNER} />
					<Routes>
						<Route
							path="/"
							element={
								<div>
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
							<Route path="/team/:team">
								<Route path="/team/:team/flow/:flowId">
									<Route
										path="/team/:team/flow/:flowId/process/:id"
										element={<ProcessDetails />}
									/>
									<Route
										path="/team/:team/flow/:flowId/overview"
										element={<TeamPlannedOverview />}
									/>
								</Route>
							</Route>
						</Route>
					</Routes>
					<Footer email={props.properties.config.contactEmail} />
				</HashRouter>
			</GlobalContext.Provider>
		</div>
	);
};
