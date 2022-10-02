import { ITaskOverview } from "@service/sp-cip/dist/models/ITaskOverview";

export default interface ITimer<T> {
    id: string;
    task?: T;
    active: boolean;
    duration: number;
    lastStartTimestamp: number;
}
