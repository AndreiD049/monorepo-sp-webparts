import { ICustomerFlow } from "@service/process-flow";
import { IUser, IUserListInfo } from "@service/users";
import * as React from "react";

export interface IGlobalContext {
    currentUser: IUser;
    teams: string[];
    selectedTeam: string;
    selectedFlow: ICustomerFlow;
    teamUsers: IUserListInfo[];
}

export const sentinelContext: IGlobalContext = {
    currentUser: null,
    teams: [],
    selectedTeam: null,
    selectedFlow: null,
    teamUsers: [],
}

export const GlobalContext = React.createContext<IGlobalContext>(sentinelContext);
