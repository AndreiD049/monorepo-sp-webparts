import { Text } from 'office-ui-fabric-react';
import * as React from 'react';
import { GlobalContext } from '../utils/GlobalContext';
import TasksTable from '../tasks/table/TasksTable';
import { ICipWebPartProps } from '../CipWebPart';
import { IReadonlyTheme } from '@microsoft/sp-component-base';
import { HashRouter, Outlet, Route, Routes } from 'react-router-dom';
import CreateTaskPanel from '../tasks/panels/CreateTask';
import { TaskDetails } from '../tasks/panels/TaskDetails';
import { LoadingAnimation } from './utils/LoadingAnimation';
import { AlertDialog } from './AlertDialog';
import MainService from '../services/main-service';
import styles from './Cip.module.scss';
import { SELECTED_TEAM_KEY } from '../utils/constants';
import useWebStorage from 'use-web-storage-api';
import { CipTimer } from './CipTimer';
import { ActionLogPanel } from './ActionLogPanel';

interface ICipProps {
    properties: ICipWebPartProps;
    theme: IReadonlyTheme;
}

const Cip: React.FC<ICipProps> = (props) => {
    const [info, setInfo] = React.useState({
        teams: [],
        currentUser: null,
    });
    const [selectedTeam, setSelectedTeam] = useWebStorage('All', {
        key: location.origin + SELECTED_TEAM_KEY,
    });

    const userService = MainService.getUserService();

    React.useEffect(() => {
        async function run(): Promise<void> {
            const teams = await userService.getTeams();
            const currentUser = await userService.getCurrentUser();
            setInfo((prev) => ({
                ...prev,
                teams,
                currentUser,
            }));
        }
        run().catch((err) => console.error(err));
    }, []);

    return (
        <GlobalContext.Provider
            value={{
                properties: props.properties,
                theme: props.theme,
                teams: info.teams,
                selectedTeam: selectedTeam,
                currentUser: info.currentUser,
            }}
        >
            <HashRouter>
                <LoadingAnimation elementId="default" />
                <Routes>
                    <Route
                        path="/"
                        element={
                            <div className={styles.cip}>
                                <Text
                                    variant="xxLargePlus"
                                    className={styles.header}
                                    block
                                >
                                    {props.properties.headerText}
                                </Text>
                                <TasksTable
                                    onTeamSelect={(team) =>
                                        setSelectedTeam(team)
                                    }
                                />
                                <Outlet />
                            </div>
                        }
                    >
                        <Route path="new" element={<CreateTaskPanel />} />
                        <Route
                            path="new/:parentId"
                            element={<CreateTaskPanel />}
                        />
                        <Route
                            path="task/:taskId/*"
                            element={<TaskDetails />}
                        />
                        <Route path="actionlog" element={<ActionLogPanel />} />
                    </Route>
                </Routes>
                <AlertDialog alertId="MAIN" />
                <CipTimer />
            </HashRouter>
        </GlobalContext.Provider>
    );
};

export default Cip;
