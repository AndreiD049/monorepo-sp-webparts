import { IReadonlyTheme } from "@microsoft/sp-component-base";
import * as React from "react";
import { ISiteUserInfo } from "sp-preset";
import { ICipWebPartProps } from "../CipWebPart";

export interface IGlobalContext {
    properties: ICipWebPartProps;
    theme: IReadonlyTheme;
    teams: string[];
    users: ISiteUserInfo[];
    selectedTeam: string;
    currentUser: ISiteUserInfo
}

export const GlobalContext = React.createContext<IGlobalContext>({
    properties: null,
    theme: null,
    teams: [],
    users: [],
    selectedTeam: 'All',
    currentUser: null,
});
