import { IUser } from "@service/users";
import * as React from "react";

export interface IGlobalContext {
    currentUser: IUser;
}

const sentinelContext: IGlobalContext = {
    currentUser: null,
}

export const GlobalContext = React.createContext<IGlobalContext>(sentinelContext);
