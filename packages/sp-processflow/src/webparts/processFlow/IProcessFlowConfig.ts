export interface IProcessFlowConfig {
    rootSite: string;
    // List of processes
    processListName: string;
    // List of flows separated by teams/customers
    customerFlowListName: string;
    // List of locations where flows are performed
    locationListName: string;
    // Process information by user (when training was done etc...)
    userProcessListName: string;
    // List of users using the webpart
    userListName: string;
}
