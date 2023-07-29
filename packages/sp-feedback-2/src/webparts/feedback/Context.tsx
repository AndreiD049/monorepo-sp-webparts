import * as React from "react";
import { ICountry } from "./features/feedback-form/countries";
import { IRequestType } from "./features/feedback-form/request-types";

export type RequestTypesDict = { [code: string]: IRequestType };

export interface IGlobalContext {
    listRootUrl: string;
    listTitle: string;
    settingListTitle: string;
	requestTypes: RequestTypesDict;
	countries: ICountry[];
}

export const GlobalContext = React.createContext<IGlobalContext>({
    listRootUrl: "",
    listTitle: "",
    settingListTitle: "",
	requestTypes: null,
	countries: [],
});

export const GlobalContextProvider: React.FC<IGlobalContext> = (props) => {
    return (
        <GlobalContext.Provider value={props}>
            {props.children}
        </GlobalContext.Provider>
    );
}
