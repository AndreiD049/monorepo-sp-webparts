import IConfigCondition from "./IConfigCondition";

export default interface ISource {
    type?: string;
    rootUrl: string;
    pageUrl: string;
    listName: string;
    filter: string;
    select: string[];
    expand: string[];
    conditions: IConfigCondition[];
    ttlMinutes: number;
    additionalSources?: { listName: string, type: 'actions' }[];
}
