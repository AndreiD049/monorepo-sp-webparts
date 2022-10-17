export default interface ITimer<T> {
    id: string;
    task?: T;
    spot: boolean;
    description?: string;
    active: boolean;
    duration: number;
    lastStartTimestamp: number;
}
