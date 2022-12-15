/**
 *  A procedure represents a part of the flow the team is handling
 *  for a particulat customer.
 *  For example: Inbound creation, Inbound booking, transport arrangement, invoicing etc...
 */
export interface IProcess {
    Id: number;
    // which software/environment is used to perform this procedure
    System: string;
    // Name of the procedure
    Title: string;
    // Category. Will be used in UI to group the porcedures for a particular flow
    Category: string;
    // FlowId: the flow to which this procedure is bound.
    FlowId: number;
    // Manuals: links to the manuals for this exact procedure
    Manual?: string;
    // How many minutes per UOM the task requires
    Allocation?: number;
    Team: string;
    UOM?: string;
}
