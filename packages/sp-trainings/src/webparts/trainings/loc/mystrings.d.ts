declare interface ITrainingsWebPartStrings {
  listsRootUrl: string;
  listsRootUrlLabel: string;
  PropertyPaneDescription: string;
  BasicGroupName: string;
  DescriptionFieldLabel: string;
  AppLocalEnvironmentSharePoint: string;
  AppLocalEnvironmentTeams: string;
  AppSharePointEnvironment: string;
  AppTeamsTabEnvironment: string;
}

declare module 'TrainingsWebPartStrings' {
  const strings: ITrainingsWebPartStrings;
  export = strings;
}
