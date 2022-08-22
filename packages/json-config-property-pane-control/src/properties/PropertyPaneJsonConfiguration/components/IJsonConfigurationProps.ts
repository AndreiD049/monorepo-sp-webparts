import { IJsonConfig } from "../PropertyPaneJsonConfiguration";

export interface IJsonConfigurationProps {
    /** props for the react component are defined here */
    // sample
    value: IJsonConfig<{}>;
    onFilenameChange: (newValue: string) => void;
    onChange: (newValue: string) => void;
}