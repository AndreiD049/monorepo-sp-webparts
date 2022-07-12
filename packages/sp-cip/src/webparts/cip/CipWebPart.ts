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
import SPBuilder, { InjectHeaders } from 'sp-preset';
import { initNotifications } from 'sp-react-notifications';

export interface ICipWebPartProps {
    headerText: string;
    rootDataSource: string;
    tasksListName: string;
    activitiesListName: string;
    attachmentsPath: string;
    teamsList: string;
    teamsField: string;
}

export default class CipWebPart extends BaseClientSideWebPart<ICipWebPartProps> {
    public static SPBuilder: SPBuilder = null;
    public static baseUrl: string;
    private _isDarkTheme: boolean = false;
    private theme: IReadonlyTheme;

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

        CipWebPart.baseUrl = this.context.pageContext.web.absoluteUrl;

        initNotifications();

        return super.onInit();
    }

    public async render(): Promise<void> {
        const element: React.ReactElement = React.createElement(
            Cip,
            {
                properties: this.properties,
                theme: this.theme,
            }
        );

        ReactDom.render(element, this.domElement);
    }

    protected onThemeChanged(currentTheme: IReadonlyTheme | undefined): void {
        if (!currentTheme) {
            return;
        }

        this.theme = currentTheme;

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

    protected onPropertyPaneFieldChanged(
        propertyPath: string,
    ): void {
        if (propertyPath === 'rootDataSource') {
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
                            groupName: strings.LabelGroupDescription,
                            groupFields: [
                                PropertyPaneTextField('headerText', {
                                    label: strings.HeaderTextLabel,
                                    description: strings.HeaderTextDescription,
                                }),
                            ],
                        },
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
                                PropertyPaneTextField('activitiesListName', {
                                    label: strings.CipCommentListLabel,
                                    description: strings.CipCommentListDescription,
                                }),
                                PropertyPaneTextField('attachmentsPath', {
                                    label: strings.AttachmentsListLabel,
                                    description: strings.AttachmentsListDescription,
                                }),
                                PropertyPaneTextField('teamsList', {
                                    label: strings.TeamsList,
                                }),
                                PropertyPaneTextField('teamsField', {

                                    label: strings.TeamsListField,
                                }),
                                PropertyPaneButton('', {
                                    text: 'Create list',
                                    buttonType: PropertyPaneButtonType.Primary,
                                    onClick: async () => {
                                        const setup = await import(
                                            /* webpackChunkName: 'CipSetupLists' */
                                            './utils/setup-lists'
                                        );
                                        const sp =
                                            await CipWebPart.SPBuilder.getSP(
                                                'Data'
                                            );
                                        await setup.default(
                                            sp,
                                            this.properties
                                        );
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
