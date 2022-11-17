import * as React from "react";

export interface IGlobalContext {
    currentUser: {}
}

const sentinelContext: IGlobalContext = {
    currentUser: null,
}

export const GlobalContext = React.createContext<IGlobalContext>(sentinelContext);
