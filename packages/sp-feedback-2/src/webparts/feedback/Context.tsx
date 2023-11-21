import * as React from "react";
import { IApplication } from "./features/applications/IApplication";
import { ICountry } from "./features/feedback-form/countries";
import { IRequestType } from "./features/feedback-form/request-types";

export type RequestTypesDict = { [code: string]: IRequestType };

export interface IGlobalContext {
    listRootUrl: string;
    listTitle: string;
    settingListTitle: string;
	requestTypes: RequestTypesDict;
	countries: ICountry[];
	applications: IApplication[];
	isTestManager: boolean;
}

export const GlobalContext = React.createContext<IGlobalContext>({
    listRootUrl: "",
    listTitle: "",
    settingListTitle: "",
	requestTypes: null,
	countries: [],
	applications: [],
	isTestManager: false,
});

export const GlobalContextProvider: React.FC<IGlobalContext> = (props) => {
    return (
        <GlobalContext.Provider value={props}>
            {props.children}
        </GlobalContext.Provider>
    );
}
