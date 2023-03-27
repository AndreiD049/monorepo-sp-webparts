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
import { initNotifications, SPnotify } from 'sp-react-notifications';
import { ListUtilsService } from './services/list-utils';
import { MessageBarType } from 'office-ui-fabric-react';
import MainService from './services/main-service';
import { IJsonConfig, PropertyPaneJsonConfiguration } from 'json-configuration';
import { initializeFileTypeIcons } from '@fluentui/react-file-type-icons';
import { openDatabase, removeExpired } from 'idb-proxy';
import { DB_NAME, STORE_NAME } from './utils/constants';

interface IConfiguration {
    rootSite: string;
    listName: string;
    commentListName: string;
    attachmentsPath: string;
    teamsList: {
        name: string;
        fieldName: string;
    };
    remotes: IRemoteSource[];
    additionalEmails?: string[];
}

export interface ICipWebPartProps {
    headerText: string;
    taskListId: string;
    config: IJsonConfig<IConfiguration>;
}

export default class CipWebPart extends BaseClientSideWebPart<ICipWebPartProps> {
    public static SPBuilder: SPBuilder = null;
    public static baseUrl: string;
    private _isDarkTheme: boolean = false;
    private theme: IReadonlyTheme;

    protected async onInit(): Promise<void> {
        initializeFileTypeIcons();
        initNotifications();

        const tennats: { [key: string]: string } = {};
        this.properties.config?.remotes?.forEach(
            (s) => (tennats[s.Name] = s.ListRoot)
        );

        try {
            CipWebPart.SPBuilder = new SPBuilder(this.context)
                .withRPM(600)
                .withTennants({
                    Data: this.properties.config.rootSite,
                    ...tennats,
                })
                .withAdditionalTimelines([
                    InjectHeaders({
                        UserAgent: `NONISV|Katoen Natie|Cip/${this.dataVersion.toString()}`,
                    }),
                ]);

            MainService.InitServices('Data', this.properties);

            CipWebPart.baseUrl = this.context.pageContext.web.absoluteUrl;
            this.properties.taskListId = await ListUtilsService.getListId(
                this.properties.config.listName
            );

            // Cleanup expired actions from past
            const db = await openDatabase(DB_NAME, STORE_NAME);
            await removeExpired(db);
        } catch (err) {
            SPnotify({
                message: err.toString(),
                messageType: MessageBarType.severeWarning,
            });
        }

        return super.onInit();
    }

    public async render(): Promise<void> {
        const element: React.ReactElement = React.createElement(Cip, {
            properties: this.properties,
            theme: this.theme,
        });

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

    protected onPropertyPaneFieldChanged(propertyPath: string): void {
        if (propertyPath === 'rootDataSource') {
            CipWebPart.SPBuilder = new SPBuilder(this.context)
                .withRPM(600)
                .withTennants({
                    Data: this.properties.config.rootSite,
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
                                new PropertyPaneJsonConfiguration('config', {
                                    ctx: this.context,
                                    value: this.properties.config,
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
