/**
 * Each flow is bound to one or more locations
 * This model is meant to distinguish between them
 * A location can be a single Site, or a Country, or any other criteria.
 * Each location is owned/done by some party. This information is required to
 * know who to contact depending on location.
 */
export interface IFlowLocation {
    Id: number;
    FlowId: number;
    Procedure: {
        Id: number;
        Procedure: string;
    }
    // Location of the procedure. Not necessarily a phisical location
    Location: string;
    // Country of the location. (if applicable)
    Country?: string;
    // DoneBy showing the party handling the procedure in this partcular location
    DoneBy: string;
}
