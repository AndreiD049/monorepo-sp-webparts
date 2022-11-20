/**
 * This is the procedure linked to a single person.
 * It's meant to be used to follow up whether this person
 * is capable of doing the procedure, or if the training was planned (and when),
 * or when the training was done + some remarks from the Trainer/manager
 */
export interface IUserProcess {
    Id: number;
    FlowId: number;
    ProcessId: number;
    // Date - ISO formatted string
    // It's a string since sharepoint returns it as a string
    // Depending on status this date will ave different meanings
    // If status:
    //      - Blank/NA - there is no meaning to this field (procedure is not done nor planned)
    //      - Planned/On-going - this is the date when training was planned
    //      - Completed - this is the date when training was completed
    Date: string;
    // User to which the procedure is bound
    User: {
        Id: number;
        Title: string;
        EMail: string;
    }
    Team: string;
    // Number of minutes required for the task to be performed
    // Depends on UOM (Unit of measure) field below
    Allocation: number;
    // UOM (Unit of measure) - the target of allocation definintion.
    // Example: if Allocation is 10 (minutes), and UOM is Order, it means the task takes 
    // on average 10 minutes per order etc...
    UOM: string;
}
