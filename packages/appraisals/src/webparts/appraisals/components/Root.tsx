import { BrowserRouter, Switch, Route } from 'react-router-dom';
import * as React from 'react';
import constants from '../utils/constants';
import AppraisalPeriods from './periods/AppraisalPeriods';
import PeriodDetails from './period-details/PeriodDetails';
import UserContext, { IUserContext } from '../utils/UserContext';
import { getSiteInfo } from '../dal/Site';
import { getCurrentUser } from '../dal/Users';
import { getUserGroups } from '../dal/Groups';
import { getTeamMembers } from '../dal/TeamMembers';
import { IUserGroupPermissions } from 'property-pane-access-control';

export interface IRootProps {
    permissions: IUserGroupPermissions;
}

const Root: React.FC<IRootProps> = (props) => {
    const [ctx, setCtx] = React.useState<IUserContext>({
        siteInfo: null,
        teamUsers: [],
        userGroups: [],
        userInfo: null,
        permissions: {},
    });

    React.useEffect(() => {
        async function run() {
            const current = await getCurrentUser();
            const result: IUserContext = {
                siteInfo: await getSiteInfo(),
                userInfo: current,
                userGroups: await getUserGroups(),
                teamUsers: await getTeamMembers(),
                permissions: props.permissions,
            };
            setCtx(result);
        }
        run();
    }, [props.permissions]);

    return (
        <UserContext.Provider value={ctx}>
            <BrowserRouter>
                <Switch>
                    <Route
                        render={({ location }) => {
                            const searchParams = new URLSearchParams(
                                location.search
                            );
                            /* If periodId query parameter is set, render appraisals periods list */
                            if (!searchParams.get(constants.periodId)) {
                                return <AppraisalPeriods />;
                            } else {
                                /* Else render details of current periodId from query params */
                                return (
                                    <PeriodDetails
                                        ID={searchParams.get(
                                            constants.periodId
                                        )}
                                    />
                                );
                            }
                        }}
                    />
                </Switch>
            </BrowserRouter>
        </UserContext.Provider>
    );
};

export default Root;
