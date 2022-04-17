import { IUserGroupPermissions } from 'property-pane-access-control';
import * as React from 'react';
import { IContextInfo } from 'sp-preset';
import GroupService, { IUserGroup } from '../dal/Groups';
import ItemService from '../dal/Items';
import { IUser } from '../dal/IUser';
import PeriodService from '../dal/Periods';
import UserService from '../dal/Users';

export interface IUserContext {
    siteInfo: IContextInfo;
    userInfo: IUser;
    userGroups: IUserGroup[];
    teamUsers: any[];
    permissions: IUserGroupPermissions;
    PeriodService: PeriodService;
    GroupService: GroupService;
    ItemService: ItemService;
    UserService: UserService;
}

const UserContext = React.createContext<IUserContext>({
    siteInfo: null,
    userInfo: null,
    userGroups: [],
    teamUsers: [],
    permissions: {},
    PeriodService: null,
    GroupService: null,
    ItemService: null,
    UserService: null,
});

export default UserContext;
