import { IUserGroupPermissions } from 'property-pane-access-control';
import * as React from 'react';
import { IContextInfo } from 'sp-preset';
import { IUserGroup } from '../dal/Groups';
import { IUser } from '../dal/IUser';
import PeriodService from '../dal/Periods';

export interface IUserContext {
    siteInfo: IContextInfo;
    userInfo: IUser;
    userGroups: IUserGroup[];
    teamUsers: any[];
    permissions: IUserGroupPermissions;
    PeriodService: PeriodService;
}

const UserContext = React.createContext<IUserContext>({
    siteInfo: null,
    userInfo: null,
    userGroups: [],
    teamUsers: [],
    permissions: {},
    PeriodService: null,
});

export default UserContext;
