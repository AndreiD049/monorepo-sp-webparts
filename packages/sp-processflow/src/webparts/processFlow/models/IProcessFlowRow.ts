import { IFlowLocation, IProcess, IUserProcess } from "@service/process-flow";

export interface IProcessFlowRow {
    process: IProcess;
    locations: { [location: string]: IFlowLocation };
    users: { [id: number]: IUserProcess | undefined };
}