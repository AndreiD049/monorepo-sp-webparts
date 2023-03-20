import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
    IPropertyPaneConfiguration,
    PropertyPaneTextField,
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { IReadonlyTheme } from '@microsoft/sp-component-base';
import { IJsonConfig, PropertyPaneJsonConfiguration } from 'json-configuration';

import * as strings from 'FeedbackWebPartStrings';
import { Feedback, IFeedbackProps } from './components/Feedback';
import { MainService } from './services/main-service';
import SPBuilder, { InjectHeaders } from 'sp-preset';
import { IFeedbackConfig } from '../../models/IFeedbackConfig';
import { syncList } from '../../features/incremental-sync';
import { IFeedbackItemRaw } from '../../models/IFeedbackItem';

export interface IFeedbackWebPartProps {
    description: string;
    config: IJsonConfig<IFeedbackConfig>;
    getItems: () => Promise<IFeedbackItemRaw[]>;
}

export default class FeedbackWebPart extends BaseClientSideWebPart<IFeedbackWebPartProps> {
    public static SPBuilder: SPBuilder = null;
    public static theme: IReadonlyTheme = null;

    public render(): void {
        if (!this.properties.config) return null;
        const element: React.ReactElement<IFeedbackProps> = React.createElement(
            Feedback,
            {
                properties: this.properties,
            }
        );

        ReactDom.render(element, this.domElement);
    }

    protected async onInit(): Promise<void> {
        FeedbackWebPart.SPBuilder = new SPBuilder(this.context)
            .withRPM(600)
            .withAdditionalTimelines([
                InjectHeaders({
                    UserAgent: `NONISV|Katoen Natie|Feedback/${this.dataVersion.toString()}`,
                }),
            ]);

        const sp = FeedbackWebPart.SPBuilder.getSP(this.properties.config?.rootUrl);
        MainService.initService(
            sp,
            this.properties.config
        );
        this.properties.getItems = await syncList(sp, this.properties.config?.listName, {
            dbName: 'SPFX-FeedbackItems',
            tokenStoreName: 'SpfxToken',
            dataStoreName: 'SpfxItems',
            fields: [ 
                {
                    field: 'ID',
                    type: 'Number',
                    key: 'Id',
                },
                {
                    field: 'Title',
                    type: 'String',
                },
                {
                    field: 'Fields',
                    type: 'String',
                },
                {
                    field: 'Author',
                    type: 'Person',
                },
                {
                    field: 'Created',
                    type: 'String',
                },
                {
                    field: 'Tags',
                    type: 'List',
                },
                {
                    field: 'IsService',
                    type: 'Boolean',
                }
            ],
        })
    }

    protected onThemeChanged(currentTheme: IReadonlyTheme | undefined): void {
        if (!currentTheme) {
            return;
        }

        FeedbackWebPart.theme = currentTheme;

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
                                    value: this.properties.config,
                                    ctx: this.context,
                                }),
                            ],
                        },
                    ],
                },
            ],
        };
    }
}
