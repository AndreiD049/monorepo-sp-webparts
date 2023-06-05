import * as React from "react";

export interface IGlobalContext {
    listRootUrl: string;
    listTitle: string;
    settingListTitle: string;
}

export const GlobalContext = React.createContext<IGlobalContext>({
    listRootUrl: "",
    listTitle: "",
    settingListTitle: ""
});

export const GlobalContextProvider: React.FC<IGlobalContext> = (props) => {
    return (
        <GlobalContext.Provider value={props}>
            {props.children}
        </GlobalContext.Provider>
    );
}