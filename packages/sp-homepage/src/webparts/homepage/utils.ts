import { DateTime } from 'luxon';
import { MessageBarType } from 'office-ui-fabric-react';
import { SPnotify } from 'sp-react-notifications';
import ISection from './models/ISection';
import ITaskItem from './models/ITaskItem';

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

export function taskSorter(log1: ITaskItem, log2: ITaskItem): number {
    return DateTime.fromISO(log1.Time).toISOTime() < DateTime.fromISO(log2.Time).toISOTime()
        ? -1
        : 1;
}

/**
 * Check if all provided source types are suppored
 * Some sections (like tasks for ex) have multiple source types used.
 * And we need to make sure user doesn't provide wrong ones or does typing mistakes
 */
export function checkSourceTypes(section: ISection, supportedSourceTypes: string[]): boolean {
    const supported = new Set(supportedSourceTypes);
    const supportetList = section.sources.map((source): boolean => {
        if (!supported.has(source.type)) {
            /** Notify the user about incorrect type */
            SPnotify({
                message: `Tasks section: Source type '${
                    source.type
                }' is not supported.\nOnly supported source types are '${Array.from(
                    supportedSourceTypes
                ).join(', ')}'.\nCheck webpart properties.`,
                timeout: 10000,
                messageType: MessageBarType.blocked,
            });
            return false;
        }
        return true;
    });
    return supportetList.every((s) => s === true);
}