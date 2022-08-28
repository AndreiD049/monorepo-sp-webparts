import ISourceCondition from "./ISourceCondition";

export default interface ISource {
    rootUrl: string;
    listName: string;
    filter: string;
    select: string[];
    expand: string[];
    conditions: ISourceCondition;
    ttlMinutes: number;
}
