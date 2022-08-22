import * as React from 'react';
import * as ReactDom from 'react-dom';
import {
  IPropertyPaneField,
  PropertyPaneFieldType
} from '@microsoft/sp-property-pane';
import { IPropertyPaneJsonConfigurationProps } from './IPropertyPaneJsonConfigurationProps';
import { IPropertyPaneJsonConfigurationInternalProps } from './IPropertyPaneJsonConfigurationInternalProps';
import { JsonConfiguration } from './components/JsonConfiguration';
import { IJsonConfigurationProps } from './components/IJsonConfigurationProps';
import JsonConfigurationService from './services/JsonConfigurationService';

export interface IJsonConfig<T> {
    sourcePath: string;
    value: T;
}

export class PropertyPaneJsonConfiguration implements IPropertyPaneField<IPropertyPaneJsonConfigurationProps> {
    public type: PropertyPaneFieldType = PropertyPaneFieldType.Custom;
    public targetProperty: string;
    public properties: IPropertyPaneJsonConfigurationInternalProps;
    private elem: HTMLElement;
    private _onChangeCallback: (
        targetProperty?: string,
        newValue?: {}
    ) => void;

    constructor(targetProperty: string, properties: IPropertyPaneJsonConfigurationProps) {
        this.targetProperty = targetProperty;
        this.properties = {
            key: targetProperty,
            value: properties.value,
            ctx: properties.ctx,
            onRender: this.onRender.bind(this),
            onDispose: this.onDispose.bind(this)
        };
        JsonConfigurationService.OnInit(properties.ctx.serviceScope);
    }

    public render(): void {
        if (!this.elem) {
        return;
        }

        this.onRender(this.elem);
    }

    private onDispose(element: HTMLElement): void {
        ReactDom.unmountComponentAtNode(element);
    }

    private onRender(
        elem: HTMLElement,
        ctx?: {},
        changeCallback?: (targetProperty?: string, newValue?: object) => void
    ): void {
        if (!this.elem) {
        this.elem = elem;
        }

        const element: React.ReactElement<IJsonConfigurationProps> = React.createElement(JsonConfiguration, {
            value: this.properties.value,
            onChange: this.onChanged.bind(this),
        });
        ReactDom.render(element, elem);

        if (changeCallback) {
            this._onChangeCallback = changeCallback;
        }
    }

    private onChanged(fileName: string, newValue: object): void {
        const result: IJsonConfig<{}> = {
            value: newValue,
            sourcePath: fileName,
        };
        this._onChangeCallback(this.targetProperty, result);
    }
}