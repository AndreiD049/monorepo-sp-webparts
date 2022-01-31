export type PeriodStatus = "Open" | "Finished";

export default interface IPeriod {
    ID: string;
    Title: string;
    Status: PeriodStatus;
    Created: string;
    Author: {
        Title: string;
    };
}
