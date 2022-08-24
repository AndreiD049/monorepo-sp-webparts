import IListInfo from "./IListInfo";

export default interface IConfig {
    users: IListInfo & { teamsColumn: string },
}
