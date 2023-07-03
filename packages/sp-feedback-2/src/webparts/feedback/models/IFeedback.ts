import { IPerson } from "./IPerson";

export interface IFeedback {
    ID: number;
    Title: string;
    Category: string;
    // New, Review, Approved, Rejected, Implemented, Closed
    Status: string;
    Description: string; // Multiline text
    Application: string;
    DevOpsItems: string[];
    Owner: IPerson; // Can be a person or a group
    RemarksBU: string; // Multiline text. TODO: What does this field mean?
    Tags: string[];
    ParentID?: number; // used for merging feedbacks that are similar
    Country: string;
	Priority: string;
}
