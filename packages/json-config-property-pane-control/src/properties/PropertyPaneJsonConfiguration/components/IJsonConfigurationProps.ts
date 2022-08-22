import { IJsonConfig } from "../PropertyPaneJsonConfiguration";

export interface IJsonConfigurationProps {
    /** props for the react component are defined here */
    // sample
    value: IJsonConfig<{}>;
    onChange: (fileName: string, newValue: string) => void;
}