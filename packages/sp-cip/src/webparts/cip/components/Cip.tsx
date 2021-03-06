import { Text } from 'office-ui-fabric-react';
import * as React from 'react';
import { GlobalContext } from '../utils/GlobalContext';
import styles from './Cip.module.scss';
import TasksTable from '../tasks/table/TasksTable';
import { ICipWebPartProps } from '../CipWebPart';
import { IReadonlyTheme } from '@microsoft/sp-component-base';
import { useUsers } from '../users/useUsers';
import { HashRouter, Outlet, Route, Routes } from 'react-router-dom';
import CreateTaskPanel from '../tasks/Panels/CreateTask';
import { TaskDetails } from '../tasks/Panels/TaskDetails';
import { LoadingAnimation } from './Utils/LoadingAnimation';
import { AlertDialog } from './AlertDialog';

interface ICipProps {
    properties: ICipWebPartProps;
    theme: IReadonlyTheme;
}

const Cip: React.FC<ICipProps> = (props) => {
    const [info, setInfo] = React.useState({
        teams: [],
        currentUser: null,
    });
    const users = useUsers({ properties: props.properties });

    React.useEffect(() => {
        async function run() {
            const teams = await users.getTeams();
            const currentUser = await users.getCurrentUser();
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
