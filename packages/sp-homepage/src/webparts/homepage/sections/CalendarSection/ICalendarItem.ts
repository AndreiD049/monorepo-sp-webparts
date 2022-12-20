export type CalendarTypes = "cip" | "processflow";

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
    Date: string;
    Process: {
        Id: number;
        Title: string;
    }
}

export type CalendarItemTypes = ICalendarCipItem | ICalendarProcessFlowItem;

export interface IWrappedCalendarItem {
    type: CalendarTypes;
    date: string;
    item: CalendarItemTypes;
}