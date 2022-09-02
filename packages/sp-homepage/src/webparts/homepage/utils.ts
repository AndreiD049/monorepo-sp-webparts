import { DateTime } from "luxon";
import ITaskItem from "./models/ITaskItem";

export function getMonthDayLabel(day: number, suffix: string = 'day'): string {
    switch (day) {
        case 1:
            return `1st ${suffix}`;
        case 2:
            return `2nd ${suffix}`;
        case 3:
            return `3rd ${suffix}`;
        default:
            return `${day}th ${suffix}`;
    }
}

export function taskSorter(log1: ITaskItem, log2: ITaskItem) {
    return DateTime.fromISO(log1.Time).toISOTime() < DateTime.fromISO(log2.Time).toISOTime() ? -1 : 1;
}