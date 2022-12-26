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
import { CALLOUT_ID, DIALOG_ID, LOCALSTORAGE_PREFIX } from '../../constants';
import { useLayout } from '../../hooks/useLayout';
import useWebStorage from 'use-web-storage-api';

const ResponsiveGridLayout = WidthProvider(Responsive);

export const Homepage: React.FC<IHomepageProps> = (props) => {
    const [locked, setLocked] = React.useState(true);
    const [team, setTeam] = useWebStorage('', {
        key: `${LOCALSTORAGE_PREFIX}/selectedTeam`,
    });
    const [selectedUser, setSelectedUser] = useWebStorage<IUser>(null, {
        key: `${LOCALSTORAGE_PREFIX}/selectedUser`
    });
    const [context, setContext] = React.useState<IGlobalContext>({
        config: props.properties.config,
        currentUser: null,
        selectedTeam: team,
        selectedUser: selectedUser,
    });
    const sections = React.useMemo(() => {
        if (selectedUser && team && context.currentUser) {
            const conditionChecker = new ConditionChecker(context.currentUser, selectedUser, team);
            const preProcessor = new SectionPreProcessor({
                currentUser: context.currentUser,
                selectedUser: selectedUser,
                selectedTeam: team,
            });
            return filterSections(props.properties.config.sections, conditionChecker, preProcessor);
        }
        return [];
    }, [selectedUser, team, context.currentUser]);
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
    }, [sections, locked, selectedUser, team]);

    React.useEffect(() => {
        async function run(): Promise<void> {
            const currentUser = await UserService.getCurrentUser();
            setContext((prev) => ({
                ...prev,
                currentUser: currentUser,
            }));
        }
        run().catch((err) => console.error(err));
    }, []);

    React.useEffect(() => {
        setContext((prev) => ({
            ...prev,
            selectedUser,
        }));
    }, [selectedUser]);

    React.useEffect(() => {
        setContext((prev) => ({
            ...prev,
            selectedTeam: team,
        }));
    }, [team]);

    return (
        <ErrorBoundary>
            <GlobalContext.Provider value={context}>
                <Callout id={CALLOUT_ID} />
                <Dialog id={DIALOG_ID} />
                <GridWrapper
                    locked={locked}
                    handleLock={(locked) => setLocked(locked)}
                    team={team}
                    handleTeamSelect={(team) => setTeam(team)}
                    user={selectedUser}
                    handleUserSelect={(user) => setSelectedUser(user)}
                >
                    {sections.length > 0 && (
                        <ResponsiveGridLayout
                            className="layout"
                            rowHeight={30}
                            cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
                            layouts={layout}
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
