import { BrowserRouter, Switch, Route } from 'react-router-dom';
import * as React from 'react';
import constants from '../utils/constants';
import AppraisalPeriods from './periods/AppraisalPeriods';
import PeriodDetails from './period-details/PeriodDetails';
import UserContext, { IUserContext } from '../utils/UserContext';
import { getSiteInfo } from '../dal/Site';
import UserService from '../dal/Users';
import { getTeamMembers } from '../dal/TeamMembers';
import { canCurrentUser } from 'property-pane-access-control';
import PeriodService from '../dal/Periods';
import GroupService from '../dal/Groups';
import ItemService from '../dal/Items';
import ManageFolderService from './folders/folder-service';
import { IAppraisalsWebPartProps } from '../AppraisalsWebPart';

export interface IRootProps {
    properties: IAppraisalsWebPartProps;
}

const Root: React.FC<IRootProps> = ({ properties }) => {
    const [period, setPeriod] = React.useState(null);

    const [ctx, setCtx] = React.useState<IUserContext>({
        siteInfo: null,
        teamUsers: [],
        userGroups: [],
        userInfo: null,
        PeriodService: new PeriodService(),
        GroupService: new GroupService(),
        ItemService: new ItemService(),
        UserService: new UserService(),
        FolderService: new ManageFolderService(properties.defaultFolderRole),
        canCreate: false,
        canFinish: false,
        canLock: false,
        canManageFolders: false,
        canSeeOtherUsers: false,
        properties: properties,
        isFolderCreated: false,
    });

    React.useEffect(() => {
        async function run() {
            const current = await ctx.UserService.getCurrentUser();
            const result: IUserContext = {
                ...ctx,
                siteInfo: await getSiteInfo(),
                userInfo: current,
                userGroups: await ctx.GroupService.getUserGroups(),
                teamUsers: await getTeamMembers(),
                canCreate: await canCurrentUser('create', properties.permissions),
                canFinish: await canCurrentUser('finish', properties.permissions),
                canLock: await canCurrentUser('lock', properties.permissions),
                canManageFolders: await canCurrentUser('manage-folders', properties.permissions),
                canSeeOtherUsers: await canCurrentUser('see-other-users', properties.permissions),
                isFolderCreated: Boolean(await ctx.FolderService.getCurrentUserFolder()),
            };
            setCtx(result);
        }
        run();
    }, [properties.permissions]);

    React.useEffect(() => {
        if (properties.showOnlyLastPeriod) {
            const service = new PeriodService();
            service.getPeriods().then((periods) => setPeriod(periods[periods.length - 1].ID));
        }
    }, [properties.showOnlyLastPeriod]);

    if (properties.showOnlyLastPeriod) {
        return period !== null && (
            <UserContext.Provider value={ctx}>
                <PeriodDetails
                    ID={period}
                />
            </UserContext.Provider>
        )
    }

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
                            if (searchParams.get(constants.periodId)) {
                                /* Else render details of current periodId from query params */
                                return (
                                    <PeriodDetails
                                        ID={searchParams.get(
                                            constants.periodId
                                        )}
                                    />
                                    );
                            } else {
                                return <AppraisalPeriods />;
                            }
                        }}
                    />
                </Switch>
            </BrowserRouter>
        </UserContext.Provider>
    );
};

export default Root;
