import {
  IPropertyPaneField,
  PropertyPaneFieldType,
} from "@microsoft/sp-property-pane";
import * as React from "react";
import * as ReactDOM from "react-dom";
import SPBuilder, { InjectHeaders } from "sp-preset";
import { IPropertyPaneJsonConfInternalProps } from "./IPropertyPaneJsonConfInternalProps";
import { IPropertyPaneJsonConfProps } from "./IPropertyPaneJsonConfProps";
import JsonConfiguration from "./JsonConfiguration";

export class PropertyPaneJsonConfBuilder<T>
  implements IPropertyPaneField<IPropertyPaneJsonConfProps>
{
  public static SPBuilder: SPBuilder;
  public type = PropertyPaneFieldType.Custom;
  public targetProperty: string;
  public properties: IPropertyPaneJsonConfInternalProps;
  private elem: HTMLElement;

  private _onChangeCallback: (targetProperty?: string, newValue?: T) => void;

  constructor(targetProperty: string, properties: IPropertyPaneJsonConfProps) {
    this.targetProperty = targetProperty;
    this.properties = {
      label: properties.label,
      webPartContext: properties.webPartContext,
      key: properties.label,
      onRender: this.onRender.bind(this),
      onDispose: this.onDispose.bind(this),
    };

    PropertyPaneJsonConfBuilder.SPBuilder = new SPBuilder(
      this.properties.webPartContext
    )
      .withRPM(200)
      .withAdditionalTimelines([
        InjectHeaders({
          Accept: "application/json;odata=nometadata",
        }),
      ]);
  }

  public render() {
    if (!this.elem) {
      return;
    }

    this.onRender(this.elem);
  }

  private onRender(
    elem: HTMLElement,
    ctx?: any,
    changeCallback?: (targetProp?: string, newValue?: T) => void
  ) {
    if (!this.elem) {
      this.elem = elem;
    }

    const element = React.createElement(JsonConfiguration, {
      label: this.properties.label,
    });

    ReactDOM.render(element, this.elem);

    if (changeCallback) {
      this._onChangeCallback = changeCallback;
    }
  }

  private onDispose(elem: HTMLElement) {
    ReactDOM.unmountComponentAtNode(elem);
  }
}

export function PropertyPaneJsonConf<T>(
  targetProperty: string,
  properties: IPropertyPaneJsonConfProps
) {
  return new PropertyPaneJsonConfBuilder<T>(targetProperty, properties);
}
