declare interface IJsonConfigurationWebPartStrings {
  PropertyPaneDescription: string;
  BasicGroupName: string;
  DescriptionFieldLabel: string;
  AppLocalEnvironmentSharePoint: string;
  AppLocalEnvironmentTeams: string;
  AppSharePointEnvironment: string;
  AppTeamsTabEnvironment: string;
}

declare module 'JsonConfigurationWebPartStrings' {
  const strings: IJsonConfigurationWebPartStrings;
  export = strings;
}
