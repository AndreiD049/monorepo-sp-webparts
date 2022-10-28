export type AppraisalItemStatus = 'Achieved' | 'Planned';

export default interface IAppraisalItem {
    Id: number;
    PlannedIn: {
        Id: number;
        Title: string;
    };
    AchievedInId?: number;
    Content: string;
    ItemType: string;
    ItemStatus: AppraisalItemStatus;
}
