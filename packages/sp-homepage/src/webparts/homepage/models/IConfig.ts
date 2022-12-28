import { Layout } from "react-grid-layout";
import IListInfo from "./IListInfo";
import ISection from "./ISection";


type Breakpoint = 'lg' | 'md' | 'sm' | 'xs' | 'xxs';

export default interface IConfig {
    users: IListInfo & { teamsColumn: string },
    contactEmail: string;
    sections: ISection[];
    layoutsLocalStorageKey: string;
    defaultLayouts: {
        [key in Breakpoint]: Layout[];
    }
}
