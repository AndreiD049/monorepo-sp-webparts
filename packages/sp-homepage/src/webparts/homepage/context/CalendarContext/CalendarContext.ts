import React from "react";

export interface ICalendarContext {
    showUser: boolean;
}

export const CalendarContext = React.createContext<ICalendarContext>({
    showUser: false,
});