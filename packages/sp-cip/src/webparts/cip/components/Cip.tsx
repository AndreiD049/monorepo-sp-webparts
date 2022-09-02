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

interface ICipProps {
    properties: ICipWebPartProps;
    theme: IReadonlyTheme;
}

const Cip: React.FC<ICipProps> = (props) => {
    const [info, setInfo] = React.useState({
        teams: [],
        currentUser: null,
    });
    const userService = MainService.getUserService();

    React.useEffect(() => {
        async function run() {
            const teams = await userService.getTeams();
            const currentUser = await userService.getCurrentUser();
            setInfo((prev) => ({
                ...prev,
                teams,
                currentUser,
            }));
        }
        run();
    }, []);

    return (
        <GlobalContext.Provider
            value={{
                properties: props.properties,
                theme: props.theme,
                teams: info.teams,
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
                                <TasksTable />
                                <Outlet />
                            </div>
                        }
                    >
                        <Route path="new" element={<CreateTaskPanel />} />
                        <Route
                            path="new/:parentId"
                            element={<CreateTaskPanel />}
                        />
                        <Route path="task/:taskId" element={<TaskDetails />} />
                    </Route>
                </Routes>
                <AlertDialog alertId="MAIN" />
            </HashRouter>
        </GlobalContext.Provider>
    );
};

export default Cip;
