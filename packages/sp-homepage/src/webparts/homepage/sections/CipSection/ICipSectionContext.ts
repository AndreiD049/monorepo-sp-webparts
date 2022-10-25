import { ISiteUserInfo } from "sp-preset";

export interface ICipSectionContext {
    statusChoices: string[];
    priorityChoices: string[];
    siteUsers: { [key: string]: ISiteUserInfo[] }
}
