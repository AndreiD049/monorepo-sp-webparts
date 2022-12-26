import React from "react";

export interface ICalendarContext {
    showUser: boolean;
    showStatus: boolean;
}

export const CalendarContext = React.createContext<ICalendarContext>({
    showUser: false,
    showStatus: false,
});
