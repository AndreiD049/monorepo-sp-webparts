import { IUser, IUserListInfo } from "@service/users";
import * as React from "react";

export interface IGlobalContext {
    currentUser: IUser;
    teams: string[];
    selectedTeam: string;
    teamUsers: IUserListInfo[];
}

export const sentinelContext: IGlobalContext = {
    currentUser: null,
    teams: [],
    selectedTeam: null,
    teamUsers: [],
}

export const GlobalContext = React.createContext<IGlobalContext>(sentinelContext);
