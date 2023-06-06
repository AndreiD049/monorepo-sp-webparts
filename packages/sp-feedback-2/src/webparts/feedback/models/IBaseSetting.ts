import { IPerson } from "./IPerson";

export interface IBaseSetting {
    ID: number;
    Title: string;
    User: IPerson;
    Data: string;
}