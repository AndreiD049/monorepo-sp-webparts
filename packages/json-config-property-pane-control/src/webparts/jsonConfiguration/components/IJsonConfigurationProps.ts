import { IJsonConfigurationWebPartProps } from "../JsonConfigurationWebPart";

export interface IJsonConfigurationProps {
  props: IJsonConfigurationWebPartProps;
  description: string;
  isDarkTheme: boolean;
  environmentMessage: string;
  hasTeamsContext: boolean;
  userDisplayName: string;
}
