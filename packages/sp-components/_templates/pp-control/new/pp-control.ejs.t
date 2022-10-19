---
to: src/properties/PropertyPane<%= Name %>/PropertyPane<%= Name %>.ts
---
import * as React from 'react';
import * as ReactDom from 'react-dom';
import {
  IPropertyPaneField,
  PropertyPaneFieldType
} from '@microsoft/sp-property-pane';
import { IPropertyPane<%= Name %>Props } from './IPropertyPane<%= Name %>Props';
import { IPropertyPane<%= Name %>InternalProps } from './IPropertyPane<%= Name %>InternalProps';
import { <%= Name %> } from './components/<%= Name %>';
import { I<%= Name %>Props } from './components/I<%= Name %>Props';
import { <%= Name %>Service } from './services/<%= Name %>Service';

export class PropertyPane<%= Name %> implements IPropertyPaneField<IPropertyPane<%= Name %>Props> {
    public type: PropertyPaneFieldType = PropertyPaneFieldType.Custom;
    public targetProperty: string;
    public properties: IPropertyPane<%= Name %>InternalProps;
    private elem: HTMLElement;
    private _onChangeCallback: (
        targetProperty?: string,
        newValue?: any
    ) => void;
    private service: <%= Name %>Service;

    constructor(targetProperty: string, properties: IPropertyPane<%= Name %>Props) {
        this.targetProperty = targetProperty;
        this.properties = {
            key: properties.label,
            label: properties.label,
            value: properties.value,
            ctx: properties.ctx,
            onRender: this.onRender.bind(this),
            onDispose: this.onDispose.bind(this)
        };
        this.service = properties.ctx.serviceScope.consume(<%= Name %>Service.serviceKey);
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
        ctx?: any,
        changeCallback?: (targetProperty?: string, newValue?: string) => void
    ): void {
        if (!this.elem) {
        this.elem = elem;
        }

        const element: React.ReactElement<I<%= Name %>Props> = React.createElement(<%= Name %>, {
            label: this.properties.label,
            value: this.properties.value,
            onChange: this.onChanged.bind(this),
        });
        ReactDom.render(element, elem);

        if (changeCallback) {
            this._onChangeCallback = changeCallback;
        }
    }

    private onChanged(newValue: string): void {
        this._onChangeCallback(this.targetProperty, newValue);
    }
}