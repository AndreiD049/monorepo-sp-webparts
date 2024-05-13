import ISource from "../../models/ISource";
import { CalendarItemTypes, CalendarTypes, ICalendarCipItem, ICalendarEvaluationItem, ICalendarProcessFlowItem, ICalendarRotationsItem } from "./ICalendarItem";

export function getExpandString(source: ISource): string[] {
    const sourceType = source.type.toLowerCase() as CalendarTypes;
    switch (sourceType) {
        case "cip":
            return ['Responsible'];
        case "processflow":
            return ['User', 'Process', 'Flow']
        case "rotations":
            return ['Personinvolved', 'Persontogo']
        case "evaluations":
            return ['Employee']
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
        case "evaluations":
            return ['Id', 'Team', 'Status', 'CurrentLevel', 'DatePlanned', 'Employee/Id', 'Employee/Title', 'Employee/EMail']
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
        case "evaluations":
            return new Date((item as ICalendarEvaluationItem).DatePlanned);
        default:
            throw Error(`Unknown source type ${sourceType}`);
    }
}
