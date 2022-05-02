declare interface ICipWebPartStrings {
  PropertyPaneDescription: string;
  LabelGroupDescription: string;
  HeaderTextLabel: string;
  HeaderTextDescription: string;
  BasicGroupName: string;
  RootDataSourceLabel: string;
  RootDataSourceDescription: string;
  CipTasksListLabel: string;
  CipTasksListDescription: string;
  CipCommentListLabel: string;
  CipCommentListDescription: string;
  AppLocalEnvironmentSharePoint: string;
  AppLocalEnvironmentTeams: string;
  AppSharePointEnvironment: string;
  AppTeamsTabEnvironment: string;
}

declare module 'CipWebPartStrings' {
  const strings: ICipWebPartStrings;
  export = strings;
}
