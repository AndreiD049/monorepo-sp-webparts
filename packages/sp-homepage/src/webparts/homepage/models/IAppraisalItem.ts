export type AppraisalItemStatus = 'Achieved' | 'Planned';

export default interface IAppraisalItem {
    Id: number;
    PlannedIn: {
        Id: number;
        Title: string;
    };
    Content: string;
    ItemType: string;
    ItemStatus: AppraisalItemStatus;
}
