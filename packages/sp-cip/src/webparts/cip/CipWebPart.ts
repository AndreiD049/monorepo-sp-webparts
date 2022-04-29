import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
    IPropertyPaneConfiguration,
    PropertyPaneButton,
    PropertyPaneButtonType,
    PropertyPaneTextField,
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { IReadonlyTheme } from '@microsoft/sp-component-base';

import * as strings from 'CipWebPartStrings';
import Cip from './components/Cip';
import { ICipProps } from './components/ICipProps';
import SPBuilder, { InjectHeaders } from 'sp-preset';
import { initNotifications } from 'sp-react-notifications';

export interface ICipWebPartProps {
    rootDataSource: string;
    tasksListName: string;
}

export default class CipWebPart extends BaseClientSideWebPart<ICipWebPartProps> {
    public static SPBuilder: SPBuilder = null;
    private _isDarkTheme: boolean = false;

    protected async onInit(): Promise<void> {
        CipWebPart.SPBuilder = new SPBuilder(this.context)
            .withRPM(600)
            .withTennants({
                Data: this.properties.rootDataSource,
            })
            .withAdditionalTimelines([
                InjectHeaders({
                    UserAgent: `NONISV|Katoen Natie|Cip/${this.dataVersion.toString()}`,
                    Accept: 'application/json;odata=nometadata',
                }),
            ]);

        initNotifications();

        return super.onInit();
    }

    public render(): void {
        const element: React.ReactElement<ICipProps> = React.createElement(
            Cip,
            {
                properties: this.properties,
            }
        );

        ReactDom.render(element, this.domElement);
    }

    protected onThemeChanged(currentTheme: IReadonlyTheme | undefined): void {
        if (!currentTheme) {
            return;
        }

        this._isDarkTheme = !!currentTheme.isInverted;
        const { semanticColors } = currentTheme;
        this.domElement.style.setProperty(
            '--bodyText',
            semanticColors.bodyText
        );
        this.domElement.style.setProperty('--link', semanticColors.link);
        this.domElement.style.setProperty(
            '--linkHovered',
            semanticColors.linkHovered
        );
    }

    protected onDispose(): void {
        ReactDom.unmountComponentAtNode(this.domElement);
    }

    protected get dataVersion(): Version {
        return Version.parse('1.0');
    }

    protected onPropertyPaneFieldChanged(propertyPath: string, oldValue: any, newValue: any): void {
        if (propertyPath === "rootDataSource") {
            CipWebPart.SPBuilder = new SPBuilder(this.context)
                .withRPM(600)
                .withTennants({
                    Data: this.properties.rootDataSource,
                })
                .withAdditionalTimelines([
                    InjectHeaders({
                        UserAgent: `NONISV|Katoen Natie|Cip/${this.dataVersion.toString()}`,
                        Accept: 'application/json;odata=nometadata',
                    }),
                ]);
        }
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
                                PropertyPaneTextField('rootDataSource', {
                                    label: strings.RootDataSourceLabel,
                                    description:
                                        strings.RootDataSourceDescription,
                                }),
                                PropertyPaneTextField('tasksListName', {
                                    label: strings.CipTasksListLabel,
                                    description:
                                        strings.CipTasksListDescription,
                                }),
                                PropertyPaneButton('', {
                                    text: 'Create list',
                                    buttonType: PropertyPaneButtonType.Primary,
                                    onClick: async () => {
                                        const setup = await import(
                                            /* webpackChunkName: 'CipSetupLists' */
                                            './utils/setup-lists'
                                        );
                                        const sp = await CipWebPart.SPBuilder.getSP('Data');
                                        await setup.default(sp, this.properties);
                                    },
                                    icon: 'Add',
                                }),
                            ],
                        },
                    ],
                },
            ],
        };
    }
}
