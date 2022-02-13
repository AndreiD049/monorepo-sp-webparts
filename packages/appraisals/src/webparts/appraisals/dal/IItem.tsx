interface IPeriodLookup {
    Id: string;
    Title: string;
}

export type ItemType =
    | 'Goal'
    | 'Training'
    | 'Strength'
    | 'Weakness'
    | 'Opportunity'
    | 'Threat'
    | 'Feedback';

export type ItemStatus = 'Planned' | 'Achieved' | 'NA';

export default interface IItem {
    Id: string;
    Content: string;
    ItemType: ItemType;
    ItemStatus: ItemStatus;
    User: {
        Title: string;
    };
    PlannedIn: IPeriodLookup;
    AchievedIn?: IPeriodLookup;
}
