---
to: src/properties/PropertyPane<%= Name %>/IPropertyPane<%= Name %>InternalProps.ts
---
import { IPropertyPaneCustomFieldProps } from '@microsoft/sp-property-pane';
import { IPropertyPane<%= Name %>Props } from './IPropertyPane<%= Name %>Props';

export interface IPropertyPane<%= Name %>InternalProps extends IPropertyPane<%= Name %>Props, IPropertyPaneCustomFieldProps {
}