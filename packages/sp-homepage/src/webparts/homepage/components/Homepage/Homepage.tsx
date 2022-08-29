import * as React from 'react';
import { GlobalContext } from '../../context/GlobalContext';
import IGlobalContext from '../../context/GlobalContext/IGlobalContext';
import UserService from '../../services/UserService';
import { Layouts, Responsive, WidthProvider } from 'react-grid-layout';
import { IHomepageProps } from './IHomepageProps';
import './grid-styles.scss';
import { Section } from '../Section';
import { GridWrapper } from '../GridWrapper';
import IUser from '../../models/IUser';
import useWebStorage from 'use-web-storage-api';
import { filterSections } from '../../services/SectionService';
import { SectionFactory } from '../SectionFactory';

const ResponsiveGridLayout = WidthProvider(Responsive);

export const Homepage: React.FC<IHomepageProps> = (props) => {
    const [locked, setLocked] = React.useState(true);
    const [team, setTeam] = React.useState(null);
    const [selectedUser, setSelectedUser] = React.useState<IUser>(null);
    const [context, setContext] = React.useState<IGlobalContext>({
        config: props.properties.config,
        currentUserInfo: null,
        selectedTeam: team,
        selectedUser: selectedUser,
    });
    const [layouts, setLayouts] = useWebStorage<Layouts>(props.properties.config.defaultLayouts, {
        key: props.properties.config.layoutsLocalStorageKey,
    });

    const sections = React.useMemo(() => {
        if (selectedUser && team) {
            return filterSections(props.properties.config.sections, selectedUser, team);
        }
        return [];
    }, [selectedUser, team]);

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
                currentUserInfo: currentUser,
            }));
            setSelectedUser(currentUser);
            setTeam(currentUser.teams[0] || null);
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
        <GlobalContext.Provider value={context}>
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
                        layouts={layouts}
                        measureBeforeMount={false}
                        // preventCollision
                        useCSSTransforms
                        isResizable={!locked}
                        isDraggable={!locked}
                        onLayoutChange={(_layouts, allLayouts) => {
                            setLayouts(allLayouts);
                        }}
                    >
                        {body}
                    </ResponsiveGridLayout>
                )}
            </GridWrapper>
        </GlobalContext.Provider>
    );
};
