import { ITaskOverview } from "@service/sp-cip/dist/models/ITaskOverview";

export default interface ITimer {
    id: string;
    task?: ITaskOverview;
    active: boolean;
    duration: number;
    lastStartTimestamp: number;
}
