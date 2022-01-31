import { IContextInfo } from "@pnp/sp/sites";
import * as React from "react";
import { IUserGroup } from "../dal/Groups";
import { IUser } from "../dal/IUser";

export interface IUserContext {
    siteInfo: IContextInfo;
    userInfo: IUser;
    userGroups: IUserGroup[];
    teamUsers: any[];
}

const UserContext = React.createContext<IUserContext>({
    siteInfo: null,
    userInfo: null,
    userGroups: [],
    teamUsers: [],
});

export default UserContext;

