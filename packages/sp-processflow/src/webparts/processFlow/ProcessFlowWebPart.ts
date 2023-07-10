import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  IPropertyPaneConfiguration,
  PropertyPaneButton,
  PropertyPaneTextField,
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { IReadonlyTheme } from '@microsoft/sp-component-base';
import SPBuilder, { InjectHeaders } from 'sp-preset';

import * as strings from 'ProcessFlowWebPartStrings';
import { ProcessFlow } from './components/ProcessFlow';
import { IJsonConfig, PropertyPaneJsonConfiguration } from 'json-configuration';
import { IProcessFlowConfig } from './IProcessFlowConfig';
import { SPnotify } from 'sp-react-notifications';
import { MessageBarType } from 'office-ui-fabric-react';
import { setupLists } from './utils/setup-lists';
import { MainService } from './services/main-service';
import './styles.css';

export interface IProcessFlowWebPartProps {
  description: string;
  config: IJsonConfig<IProcessFlowConfig>;
}

export default class ProcessFlowWebPart extends BaseClientSideWebPart<IProcessFlowWebPartProps> {
  public static SPBuilder: SPBuilder = null;
  public static currentTheme: IReadonlyTheme | undefined = null;
  private _isDarkTheme: boolean = false;
  public render(): void {
    const element: React.ReactElement = React.createElement(ProcessFlow, {
      properties: this.properties,
    });

    ReactDom.render(element, this.domElement);
  }

  protected async onInit(): Promise<void> {
    try {
      ProcessFlowWebPart.SPBuilder = new SPBuilder(this.context)
        .withRPM(600)
        .withTennants({
          Data: this.properties.config.rootSite,
        })
        .withAdditionalTimelines([
          InjectHeaders({
            UserAgent: `NONISV|Katoen Natie|ProcessFlow/${this.dataVersion.toString()}`,
          }),
        ]);
      MainService.InitServices({
        sp: ProcessFlowWebPart.SPBuilder.getSP(this.properties.config.rootSite),
        userSP: ProcessFlowWebPart.SPBuilder.getSP(this.properties.config.userListRootSite),
        manualSP: ProcessFlowWebPart.SPBuilder.getSP(this.properties.config.manualsRootSite),
        config: this.properties.config,
      });
    } catch (err) {
      SPnotify({
        message: `Error initializing @pnp/sp.\n${err}`,
        messageType: MessageBarType.error,
      });
    }
    return super.onInit();
  }

  protected onThemeChanged(currentTheme: IReadonlyTheme | undefined): void {
    if (!currentTheme) {
      return;
    }

    ProcessFlowWebPart.currentTheme = currentTheme;

    this._isDarkTheme = !!currentTheme.isInverted;
    const { semanticColors } = currentTheme;

    if (semanticColors) {
      this.domElement.style.setProperty(
        '--bodyText',
        semanticColors.bodyText || null
      );
      this.domElement.style.setProperty(
        '--link',
        semanticColors.link || null
      );
      this.domElement.style.setProperty(
        '--linkHovered',
        semanticColors.linkHovered || null
      );
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
            description: strings.PropertyPaneDescription,
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField('description', {
                  label: strings.DescriptionFieldLabel,
                }),
                new PropertyPaneJsonConfiguration('config', {
                  ctx: this.context,
                  value: this.properties.config,
                }),
                PropertyPaneButton('', {
                  text: 'Create lists',
                  onClick: () =>
                    setupLists(this.properties.config),
                }),
              ],
            },
          ],
        },
      ],
    };
  }
}
