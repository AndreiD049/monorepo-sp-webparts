import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
    IPropertyPaneConfiguration,
    IPropertyPaneField,
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
import { MessageBarType } from '@fluentui/react';
import MainService from './services/main-service';
import { initializeFileTypeIcons } from '@fluentui/react-file-type-icons';
import { openDatabase, removeExpired } from 'idb-proxy';
import { IPropertyFieldCodeEditorPropsInternal } from '@pnp/spfx-property-controls/lib/PropertyFieldCodeEditor';
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
    additionalEmails?: string[];
    notesRoot?: string;
}

const stubConfig: IConfiguration = {
	rootSite: 'https://example.sharepoint.com/sites/SiteWhereDataIsStored',
	listName: 'List name where tasks are stored',
	commentListName: 'List name where comments and actions are stored',
	attachmentsPath: 'The name of the library where attachments are stored',
	teamsList: {
		name: 'Name of the list that contains the User information',
		fieldName: 'Team',
	},
	notesRoot: '/sites/PathToOneNoteNotebook'
};

export interface ICipWebPartProps {
    headerText: string;
    taskListId: string;
    config: IConfiguration;
    strConfig: string;
}

export default class CipWebPart extends BaseClientSideWebPart<ICipWebPartProps> {
    public static SPBuilder: SPBuilder = null;
    public static baseUrl: string;
    private theme: IReadonlyTheme;
    private codeEditor: IPropertyPaneField<IPropertyFieldCodeEditorPropsInternal>;

    protected async onInit(): Promise<void> {
        initializeFileTypeIcons();
        initNotifications();

        try {
            CipWebPart.SPBuilder = new SPBuilder(this.context)
                .withRPM(600)
                .withTennants({
                    Data: this.properties.config.rootSite,
                })
                .withAdditionalTimelines([
                    InjectHeaders({
                        UserAgent: `NONISV|Katoen Natie|Cip/${this.dataVersion?.toString()}`,
                        // Do not uncomment below; metadata is required by
                        // pnp-js to properly work with attachments and files
                        // Accept: 'application/json;odata=minimal',
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
                message: err?.toString(),
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

	protected onAfterDeserialize(deserializedObject: ICipWebPartProps, dataVersion: Version): ICipWebPartProps { 
		try {
			deserializedObject.config = JSON.parse(deserializedObject.strConfig);
		} catch {
			deserializedObject.config = null
		}
		return deserializedObject;
	}
	
    protected async loadPropertyPaneResources(): Promise<void> {
        const editor = await import(
            /* webpackChunkName: 'CipCodeEditorPane' */
            '@pnp/spfx-property-controls/lib/PropertyFieldCodeEditor'
        );
        this.codeEditor = editor.PropertyFieldCodeEditor('strConfig', {
            label: 'JSON Configuration',
            panelTitle: 'JSON Configuration',
            initialValue: this.properties.strConfig || JSON.stringify(stubConfig),
            onPropertyChange: this.onPropertyPaneFieldChanged,
            properties: this.properties,
            disabled: false,
            key: 'jsonConfigCodeEditor',
            language: editor.PropertyFieldCodeEditorLanguages.JSON,
            options: {
                wrap: true,
                fontSize: 16,
            },
        });
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
								this.codeEditor,
                                PropertyPaneButton('', {
                                    text: 'Create list',
                                    buttonType: PropertyPaneButtonType.Primary,
                                    onClick: async () => {
                                        const setup = await import(
                                            /* webpackChunkName: 'CipSetupLists' */
                                            './utils/setup-lists'
                                        );
                                        const sp =
                                            CipWebPart.SPBuilder.getSP('Data');
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
