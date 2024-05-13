export type CalendarTypes = 'cip' | 'processflow' | 'rotations' | 'evaluations';

interface UserExanded {
    Id: number;
    Title: string;
    EMail: string;
}

export interface ICalendarCipItem {
    Id: number;
    Responsible: UserExanded;
    DueDate: string;
    Status: string;
    Title: string;
}

export interface ICalendarProcessFlowItem {
    Id: number;
    User: UserExanded;
    Status: string;
    Flow: {
        Id: number;
    };
    Team: string;
    Date: string;
    Process: {
        Id: number;
        Title: string;
    };
}

export interface ICalendarRotationsItem {
    Id: number;
    Personinvolved: UserExanded;
    Persontogo: UserExanded;
    Dateplanned: string;
    Status: string;
    Activityrecommended: string;
}

export interface ICalendarEvaluationItem {
    Id: number;
	Team: string;
    Status: string;
	CurrentLevel: string;
	DatePlanned: string;
	Employee: UserExanded;
}

export type CalendarItemTypes =
    | ICalendarCipItem
    | ICalendarProcessFlowItem
    | ICalendarRotationsItem
	| ICalendarEvaluationItem;

export interface IWrappedCalendarItem {
    type: CalendarTypes;
    pageUrl: string;
    date: Date;
    item: CalendarItemTypes;
}
