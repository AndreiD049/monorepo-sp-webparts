import ISource from "../../models/ISource";
import { CalendarItemTypes, CalendarTypes, ICalendarCipItem, ICalendarProcessFlowItem, ICalendarRotationsItem } from "./ICalendarItem";

export function getExpandString(source: ISource): string[] {
    const sourceType = source.type.toLowerCase() as CalendarTypes;
    switch (sourceType) {
        case "cip":
            return ['Responsible'];
        case "processflow":
            return ['User', 'Process', 'Flow']
        case "rotations":
            return ['Personinvolved', 'Persontogo']
        default:
            throw Error(`Unknown source type ${sourceType}`);
    }
}

export function getSelectString(source: ISource): string[] {
    const sourceType = source.type.toLowerCase() as CalendarTypes;
    switch (sourceType) {
        case "cip":
            return ['Responsible/Id', 'Responsible/Title', 'Responsible/EMail', 'DueDate', 'Status', 'ID', 'Title'];
        case "processflow":
            return ['User/Id', 'User/Title', 'User/EMail', 'Date', 'Team', 'Flow/Id', 'Status', 'ID', 'Process/Id', 'Process/Title']
        case "rotations":
            return ['Id', 'Personinvolved/Id', 'Personinvolved/Title', 'Personinvolved/EMail', 'Persontogo/Id', 'Persontogo/Title', 'Persontogo/EMail', 'Dateplanned', 'Status', 'Activityrecommended']
        default:
            throw Error(`Unknown source type ${sourceType}`);
    }
}

export function getSourceDate(source: ISource, item: CalendarItemTypes): Date {
    const sourceType = source.type.toLowerCase() as CalendarTypes;
    switch (sourceType) {
        case "cip":
            return new Date((item as ICalendarCipItem).DueDate);
        case "processflow":
            return new Date((item as ICalendarProcessFlowItem).Date);
        case "rotations":
            return new Date((item as ICalendarRotationsItem).Dateplanned);
        default:
            throw Error(`Unknown source type ${sourceType}`);
    }
}
