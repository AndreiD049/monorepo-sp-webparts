import { IReadonlyTheme } from "@microsoft/sp-component-base";
import { ITaskTimingDict } from "@service/sp-cip/dist/models/ITaskOverview";
import * as React from "react";
import { ISiteUserInfo } from "sp-preset";
import { ICipWebPartProps } from "../CipWebPart";

export interface IGlobalContext {
    properties: ICipWebPartProps;
    theme: IReadonlyTheme;
    teams: string[];
    users: ISiteUserInfo[];
    selectedTeam: string;
    currentUser: ISiteUserInfo;
	timingInfo: ITaskTimingDict;
}

export const GlobalContext = React.createContext<IGlobalContext>({
    properties: null,
    theme: null,
    teams: [],
    users: [],
    selectedTeam: 'All',
    currentUser: null,
	timingInfo: {},
});
