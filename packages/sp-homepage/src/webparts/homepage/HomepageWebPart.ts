import UserService from './services/UserService';
import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import { IPropertyPaneConfiguration } from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { IReadonlyTheme } from '@microsoft/sp-component-base';

import * as strings from 'HomepageWebPartStrings';
import { Homepage } from './components/Homepage/Homepage';
import { IHomepageProps } from './components/Homepage/IHomepageProps';
import { IJsonConfig, PropertyPaneJsonConfiguration } from 'json-configuration';
import IConfig from './models/IConfig';
import SPBuilder, { InjectHeaders } from 'sp-preset';

export interface IHomepageWebPartProps {
    config: IJsonConfig<IConfig>;
}

export default class HomepageWebPart extends BaseClientSideWebPart<IHomepageWebPartProps> {
    public static spBuilder: SPBuilder;
    private _isDarkTheme: boolean = false;
    private _environmentMessage: string = '';

    public render(): void {
        const element: React.ReactElement<IHomepageProps> = React.createElement(Homepage, {
            properties: this.properties,
        });

        ReactDom.render(element, this.domElement);
    }

    protected async onInit(): Promise<void> {
        HomepageWebPart.spBuilder = new SPBuilder(this.context)
            .withRPM(600)
            .withAdditionalTimelines([
                InjectHeaders({
                    Accept: 'application/json;odata=nometadata',
                }),
            ]);
        this._environmentMessage = this._getEnvironmentMessage();
        if (this.properties.config.users) {
            UserService.Init(this.context, this.properties.config);
        }

        return super.onInit();
    }

    private _getEnvironmentMessage(): string {
        if (!!this.context.sdks.microsoftTeams) {
            // running in Teams
            return this.context.isServedFromLocalhost
                ? strings.AppLocalEnvironmentTeams
                : strings.AppTeamsTabEnvironment;
        }

        return this.context.isServedFromLocalhost
            ? strings.AppLocalEnvironmentSharePoint
            : strings.AppSharePointEnvironment;
    }

    protected onThemeChanged(currentTheme: IReadonlyTheme | undefined): void {
        if (!currentTheme) {
            return;
        }

        this._isDarkTheme = !!currentTheme.isInverted;
        const { semanticColors } = currentTheme;

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
                        description: strings.PropertyPaneDescription,
                    },
                    groups: [
                        {
                            groupName: strings.BasicGroupName,
                            groupFields: [
                                new PropertyPaneJsonConfiguration('config', {
                                    ctx: this.context,
                                    value: this.properties.config,
                                }),
                            ],
                        },
                    ],
                },
            ],
        };
    }
}
