import * as React from "react";
import { ICipWebPartProps } from "../CipWebPart";

export interface IGlobalContext {
    properties: ICipWebPartProps;
}

export const GlobalContext = React.createContext<IGlobalContext>({
    properties: null,
});