declare interface IProcessFlowWebPartStrings {
  PropertyPaneDescription: string;
  BasicGroupName: string;
  DescriptionFieldLabel: string;
  AppLocalEnvironmentSharePoint: string;
  AppLocalEnvironmentTeams: string;
  AppSharePointEnvironment: string;
  AppTeamsTabEnvironment: string;
}

declare module 'ProcessFlowWebPartStrings' {
  const strings: IProcessFlowWebPartStrings;
  export = strings;
}
