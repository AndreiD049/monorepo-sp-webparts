import * as React from 'react';
import { GlobalContext } from '../../context/GlobalContext';
import IGlobalContext from '../../context/GlobalContext/IGlobalContext';
import UserService from '../../services/UserService';
import { Responsive, WidthProvider } from 'react-grid-layout';
import { IHomepageProps } from './IHomepageProps';
import './grid-styles.scss';
import { Section } from '../Section';
import { GridWrapper } from '../GridWrapper';
import IUser from '../../models/IUser';
import { filterSections } from '../../services/SectionService';
import { SectionFactory } from '../SectionFactory';
import { ConditionChecker } from '../../services/ConditionChecker';
import { SectionPreProcessor } from '../../services/SectionPreProcessor';
import { Callout, Dialog, ErrorBoundary } from 'sp-components';
import {
    CALLOUT_ID,
    DIALOG_ID,
    LOCALSTORAGE_PREFIX,
    SEE_ALL_TEAMS,
    SEE_THEIR_TEAM_MEMBERS,
} from '../../constants';
import { useLayout } from '../../hooks/useLayout';
import useWebStorage from 'use-web-storage-api';
import { canCurrentUser } from 'property-pane-access-control';
import IUserCustom from '../../models/IUserCustom';
import { selectTeam, selectUser } from '../../events';

const ResponsiveGridLayout = WidthProvider(Responsive);

const getAvailableUsers = async (
    context: Pick<
        IGlobalContext,
        'currentUser' | 'selectedTeam' | 'canSeeAllTeams' | 'canSeeTheirTeamMembers'
    >
): Promise<IUserCustom[]> => {
    const { currentUser, canSeeAllTeams, canSeeTheirTeamMembers, selectedTeam } = context;
	if (!currentUser) {
		return [];
	}

    if (!canSeeAllTeams && !canSeeTheirTeamMembers) {
        const cu = await UserService.getCustomUser(currentUser.Id);
        return [cu];
    }
    const users = await UserService.getCustomUsersByTeam(selectedTeam);
    return users;
};

export const Homepage: React.FC<IHomepageProps> = (props) => {
    const [locked, setLocked] = React.useState(true);
    const [selectedTeam, setSelectedTeam] = useWebStorage('', {
        key: `${LOCALSTORAGE_PREFIX}/selectedTeam`,
    });
    const [selectedUser, setSelectedUser] = useWebStorage<IUser>(null, {
        key: `${LOCALSTORAGE_PREFIX}/selectedUser`,
    });
    const [context, setContext] = React.useState<IGlobalContext>({
        config: props.properties.config,
        currentUser: null,
        availableUsers: [],
        selectedTeam: selectedTeam,
        selectedUser: selectedUser,
        teams: [],
        canSeeAllTeams: false,
        canSeeTheirTeamMembers: false,
    });
    const sections = React.useMemo(() => {
        if (!selectedUser || !selectedTeam || !context.currentUser) {
            return [];
        }
        const conditionChecker = new ConditionChecker(
            context.currentUser,
            selectedUser,
            selectedTeam
        );
        const preProcessor = new SectionPreProcessor({
            currentUser: context.currentUser,
            selectedUser: selectedUser,
            selectedTeam: selectedTeam,
        });
        return filterSections(props.properties.config.sections, conditionChecker, preProcessor);
    }, [selectedUser, selectedTeam, context.currentUser]);

    const { layout, handleLayoutChange } = useLayout(
        context.currentUser,
        selectedUser,
        props.properties.config
    );

    const body = React.useMemo(() => {
        return sections.map((s) => (
            <Section key={s.name} section={s} editable={!locked}>
                <SectionFactory section={s} />
            </Section>
        ));
    }, [sections, locked, selectedUser, selectedTeam]);

    React.useEffect(() => {
        async function run(): Promise<void> {
            const currentUser = await UserService.getCurrentUser();
            const canSeeAllTeams = await canCurrentUser(
                SEE_ALL_TEAMS,
                props.properties.permissions
            );
            const canSeeTheirTeamMembers =
                canSeeAllTeams ||
                (await canCurrentUser(SEE_THEIR_TEAM_MEMBERS, props.properties.permissions));
            if (!canSeeAllTeams && !currentUser.teams) {
                selectTeam('');
            }
			let team = selectedTeam;
            let teams: string[] = [];
            if (canSeeAllTeams) {
                teams = await UserService.getTeams();
            } else {
                teams = currentUser.teams;
            }

			// Handle select team
			const isSelectedTeamValid = teams.some((t) => t === selectedTeam);
			if (!isSelectedTeamValid) {
				team = teams[0] || '';
                selectTeam(team);
			}

            const availableUsers = await getAvailableUsers({
                currentUser: currentUser,
                selectedTeam: team,
                canSeeAllTeams: canSeeAllTeams,
                canSeeTheirTeamMembers: canSeeTheirTeamMembers,
            });

			if (!selectedUser) {
				selectUser(currentUser);
			}

            setContext((prev) => ({
                ...prev,
                currentUser,
                availableUsers,
                canSeeAllTeams,
                canSeeTheirTeamMembers,
                teams,
            }));
        }
        run().catch((err) => console.error(err));
    }, []);

    React.useEffect(() => {
        // User change
        const handleUserChange = async (event: CustomEvent<{ user: IUser }>): Promise<void> => {
            setSelectedUser(event.detail.user);
            setContext((prev) => ({
                ...prev,
                selectedUser: event.detail.user,
            }));
        };
        document.addEventListener('SELECTED_USER_CHANGE', handleUserChange);

        const handleTeamChange = async (event: CustomEvent<{ team: string }>): Promise<void> => {
            const team = event.detail.team;
            setSelectedTeam(team);
            const update: Partial<IGlobalContext> = {
                selectedTeam: team,
            };
            // If the team was changed, we need to update the available users
            const { currentUser, canSeeAllTeams, canSeeTheirTeamMembers, selectedUser } = context;

            update.availableUsers = await getAvailableUsers({
                currentUser: currentUser,
                selectedTeam: team,
                canSeeAllTeams: canSeeAllTeams,
                canSeeTheirTeamMembers: canSeeTheirTeamMembers,
            });

            const isCurrentSelectedUserInTeam = Boolean(
                !selectedUser || update.availableUsers.find((u) => u.User.Id === selectedUser.Id)
            );
            const isCurrentUserInTeam = Boolean(
                update.availableUsers.find((u) => u.User.Id === currentUser.Id)
            );
            if (!isCurrentSelectedUserInTeam) {
                let user: IUser = null;
                if (isCurrentUserInTeam) {
                    user = await UserService.getUser(currentUser.Id);
                } else if (update.availableUsers.length > 0) {
                    user = await UserService.getUser(update.availableUsers[0].User.Id);
                }
				if (user) {
					selectUser(user);
				}
            }

            setContext((prev) => ({
                ...prev,
                ...update,
            }));
        };
        document.addEventListener('SELECTED_TEAM_CHANGE', handleTeamChange);

        return () => {
            document.removeEventListener('SELECTED_USER_CHANGE', handleUserChange);
            document.removeEventListener('SELECTED_TEAM_CHANGE', handleTeamChange);
        };
    }, [context]);

    return (
        <ErrorBoundary>
            <GlobalContext.Provider value={context}>
                <Callout id={CALLOUT_ID} />
                <Dialog id={DIALOG_ID} />
                <GridWrapper
                    locked={locked}
                    handleLock={(locked) => setLocked(locked)}
                    team={selectedTeam}
                    user={selectedUser}
                    users={context.availableUsers}
                >
                    {sections.length > 0 && (
                        <ResponsiveGridLayout
                            className="layout"
                            rowHeight={30}
                            cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
                            layouts={layout || props.properties.config.defaultLayouts}
                            measureBeforeMount={false}
                            // preventCollision
                            useCSSTransforms
                            isResizable={!locked}
                            isDraggable={!locked}
                            onLayoutChange={handleLayoutChange}
                        >
                            {body}
                        </ResponsiveGridLayout>
                    )}
                </GridWrapper>
            </GlobalContext.Provider>
        </ErrorBoundary>
    );
};
