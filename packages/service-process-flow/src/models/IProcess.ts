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
	// Stored as JSON
	// example:
	// {
	//		"Id": "123124-123141ree13-1asdasd",
	//		"Name": "Some manual.docx",
	//		"isDoc": true,
	//		"Link": "https://devadmintools.sharepoint.com/:w:/s/Admin-tools/EQH1WopWibNPqyNXPNsA4iEB_TmwhJF24vGDua2DrC38IQ?e=glVhQq",
	//		"page": 1
	// }
    Manual?: string;
	OrderIndex: number;
    // How many minutes per UOM the task requires
    Allocation?: number;
    Team: string;
    UOM?: string;
}
