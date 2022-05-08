import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { IReadonlyTheme } from '@microsoft/sp-component-base';

import * as strings from 'TestProjectWebPartStrings';
import TestProject from './components/TestProject';
import { ITestProjectProps } from './components/ITestProjectProps';
import SPBuilder from 'sp-preset';
import { SPnotify } from 'sp-react-notifications';
import { MessageBarType } from 'office-ui-fabric-react';

export interface ITestProjectWebPartProps {
  description: string;
}

export default class TestProjectWebPart extends BaseClientSideWebPart<ITestProjectWebPartProps> {
  public static spBuilder: SPBuilder; 
  public static baseUrl: string;

  private _isDarkTheme: boolean = false;
  private _environmentMessage: string = '';

  protected async onInit(): Promise<void> {
    this._environmentMessage = this._getEnvironmentMessage();

    TestProjectWebPart.baseUrl = this.context.pageContext.web.absoluteUrl;
    TestProjectWebPart.spBuilder = new SPBuilder(this.context)
      .withRPM(10, false, true, (message: string) => SPnotify({
        message,
        messageType: MessageBarType.severeWarning,
      }))
      .withThrottlingControl({
        onThrottlingAlert: (wait) => SPnotify({
          message: `Application is being throttled. Please retry in ${wait}`,
          messageType: MessageBarType.severeWarning,
        }),
      });

    return super.onInit();
  }

  public render(): void {
    const element: React.ReactElement<ITestProjectProps> = React.createElement(
      TestProject,
      {
        description: this.properties.description,
        isDarkTheme: this._isDarkTheme,
        environmentMessage: this._environmentMessage,
        hasTeamsContext: !!this.context.sdks.microsoftTeams,
        userDisplayName: this.context.pageContext.user.displayName
      }
    );

    ReactDom.render(element, this.domElement);
  }

  private _getEnvironmentMessage(): string {
    if (!!this.context.sdks.microsoftTeams) { // running in Teams
      return this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentTeams : strings.AppTeamsTabEnvironment;
    }

    return this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentSharePoint : strings.AppSharePointEnvironment;
  }

  protected onThemeChanged(currentTheme: IReadonlyTheme | undefined): void {
    if (!currentTheme) {
      return;
    }

    this._isDarkTheme = !!currentTheme.isInverted;
    const {
      semanticColors
    } = currentTheme;
    this.domElement.style.setProperty('--bodyText', semanticColors.bodyText);
    this.domElement.style.setProperty('--link', semanticColors.link);
    this.domElement.style.setProperty('--linkHovered', semanticColors.linkHovered);

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
                PropertyPaneTextField('description', {
                  label: strings.DescriptionFieldLabel
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
