/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from 'react';
import { IContextInfo } from 'sp-preset';
import { IAppraisalsWebPartProps } from '../AppraisalsWebPart';
import ManageFolderService from '../components/folders/folder-service';
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
    PeriodService: PeriodService;
    GroupService: GroupService;
    ItemService: ItemService;
    UserService: UserService;
    FolderService: ManageFolderService;
    canCreate: boolean;
    canFinish: boolean;
    canLock: boolean;
    canManageFolders: boolean;
    canSeeOtherUsers: boolean;
    properties: IAppraisalsWebPartProps;
    isFolderCreated: boolean;
}

const UserContext = React.createContext<IUserContext>({
    siteInfo: null,
    userInfo: null,
    userGroups: [],
    teamUsers: [],
    properties: null,
    PeriodService: null,
    GroupService: null,
    ItemService: null,
    UserService: null,
    FolderService: null,
    canCreate: false,
    canFinish: false,
    canLock: false,
    canManageFolders: false,
    canSeeOtherUsers: false,
    isFolderCreated: false,
});

export default UserContext;
