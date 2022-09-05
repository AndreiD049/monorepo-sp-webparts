import { ITaskOverview } from "../tasks/ITaskOverview";

export default interface ITimer {
    id: string;
    task?: ITaskOverview;
    active: boolean;
    duration: number;
    lastStartTimestamp: number;
}
