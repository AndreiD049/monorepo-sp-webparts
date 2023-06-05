import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { IReadonlyTheme } from '@microsoft/sp-component-base';

import * as strings from 'FeedbackWebPartStrings';
import { Router } from './components/Router';
import { NoSetup } from './components/NoSetup';

export interface IFeedbackWebPartProps {
  listRootUrl: string;
  listTitle: string;
  settingListTitle: string;
}

export default class FeedbackWebPart extends BaseClientSideWebPart<IFeedbackWebPartProps> {
  private settingsDone: boolean = false;

  public render(): void {
    let element: React.ReactElement ;

    if (this.settingsDone) {
      element = React.createElement(Router);
    } else {
      element = React.createElement(NoSetup, { properties: this.properties });      
    }

    ReactDom.render(element, this.domElement);
  }

  protected async onInit(): Promise<void> {
    // If new settings are that are mandatory
    // they should be added here
    // If some settings are missing, webpart will not render
    if (this.properties.listRootUrl && this.properties.listTitle && this.properties.settingListTitle) {
      this.settingsDone = true;
    }
  }

  protected onThemeChanged(currentTheme: IReadonlyTheme | undefined): void {
    if (!currentTheme) {
      return;
    }

    const {
      semanticColors
    } = currentTheme;

    if (semanticColors) {
      this.domElement.style.setProperty('--bodyText', semanticColors.bodyText || null);
      this.domElement.style.setProperty('--link', semanticColors.link || null);
      this.domElement.style.setProperty('--linkHovered', semanticColors.linkHovered || null);
    }

  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField('listRootUrl', {
                  label: strings.RootUrl
                }),
                PropertyPaneTextField('listTitle', {
                  label: strings.ListTitle
                }),
                PropertyPaneTextField('settingListTitle', {
                  label: strings.SettingListTitle
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
