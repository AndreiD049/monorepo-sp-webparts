import { IReadonlyTheme } from "@microsoft/sp-component-base";
import * as React from "react";
import { ICipWebPartProps } from "../CipWebPart";

export interface IGlobalContext {
    properties: ICipWebPartProps;
    theme: IReadonlyTheme;
}

export const GlobalContext = React.createContext<IGlobalContext>({
    properties: null,
    theme: null,
});