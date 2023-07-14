import { IPerson } from "./IPerson";

export type StatusType = 'New' | 'Review' | 'Approved' | 'Rejected' | 'Implemented' | 'Closed';

export interface IFeedback {
    ID: number;
    Title: string;
    Category: string;
    // New, Review, Approved, Rejected, Implemented, Closed
    Status: StatusType;
    Description: string; // Multiline text
    Application: string;
    DevOpsItems: string[];
    Owner: IPerson; // Can be a person or a group
	Author: IPerson;
	Created: string;
	Editor: IPerson;
	Modified: string;
    RemarksBU: string; // Multiline text. TODO: What does this field mean?
    Tags: string[];
    ParentID?: number; // used for merging feedbacks that are similar
    Country: string;
	Priority: string;
}
