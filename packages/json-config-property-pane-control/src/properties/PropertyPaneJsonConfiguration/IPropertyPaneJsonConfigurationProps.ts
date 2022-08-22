import { IJsonConfig } from "./PropertyPaneJsonConfiguration";

/**
 * Those are the props that will be passed by your web-part
 */
export interface IPropertyPaneJsonConfigurationProps {
    value: IJsonConfig<{}>;
    ctx: any;
}