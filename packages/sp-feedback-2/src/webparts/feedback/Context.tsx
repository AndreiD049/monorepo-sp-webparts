import * as React from "react";
import { IRequestType } from "./features/feedback-form/request-types";

export type RequestTypesDict = { [code: string]: IRequestType };

export interface IGlobalContext {
    listRootUrl: string;
    listTitle: string;
    settingListTitle: string;
	requestTypes: RequestTypesDict;
}

export const GlobalContext = React.createContext<IGlobalContext>({
    listRootUrl: "",
    listTitle: "",
    settingListTitle: "",
	requestTypes: null,
});

export const GlobalContextProvider: React.FC<IGlobalContext> = (props) => {
    return (
        <GlobalContext.Provider value={props}>
            {props.children}
        </GlobalContext.Provider>
    );
}
