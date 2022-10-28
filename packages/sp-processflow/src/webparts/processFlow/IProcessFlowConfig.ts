export interface IProcessFlowConfig {
    rootSite: string;
    listName: string;
    customerListName: string;
    teamList: {
        name: string;
        fieldName: string;
    }
}
