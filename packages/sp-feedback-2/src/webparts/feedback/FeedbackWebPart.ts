import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
    IPropertyPaneConfiguration,
    PropertyPaneTextField,
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { IReadonlyTheme } from '@microsoft/sp-component-base';

import * as strings from 'FeedbackWebPartStrings';
import { NoSetup } from './components/NoSetup';
import { Router } from './Router';
import { SettingsService } from './services/settings-service';
import SPBuilder from 'sp-preset';
import { FeedbackService } from './features/feedback/feedback-service';
import { UserService } from './features/users/users-service';
import './styles.css';
import { TagService } from './features/tags/TagAddButton/tag-service';
import AccessControl, {
    IUserGroupPermissions,
    setupAccessControl,
} from 'property-pane-access-control';
import { AttachmentService } from './features/attachments/attachments-service';
import { initializeFileTypeIcons } from '@fluentui/react-file-type-icons';

export interface IFeedbackWebPartProps {
    listRootUrl: string;
    listTitle: string;
    settingListTitle: string;
    attachmentLibraryName: string;
    permissions: IUserGroupPermissions;
}

export default class FeedbackWebPart extends BaseClientSideWebPart<IFeedbackWebPartProps> {
    private settingsDone: boolean = false;
	public static theme: IReadonlyTheme;

    public async render(): Promise<void> {
        let element: React.ReactElement;

        if (this.settingsDone) {
            element = React.createElement(Router, { ...this.properties });
        } else {
            element = React.createElement(NoSetup, {
                properties: this.properties,
            });
        }

        ReactDom.render(element, this.domElement);
    }

    protected async onInit(): Promise<void> {
        // If new settings are that are mandatory
        // they should be added here
        // If some settings are missing, webpart will not render
        if (
            this.properties.listRootUrl &&
            this.properties.listTitle &&
            this.properties.settingListTitle
        ) {
            this.settingsDone = true;
        }

        // Init services
        const sp = new SPBuilder(this.context).getSP(
            this.properties.listRootUrl
        );
        SettingsService.initService(sp, this.properties.settingListTitle);
        FeedbackService.initService(sp, this.properties.listTitle);
        AttachmentService.initService(
            sp,
            this.properties.listTitle,
            this.properties.attachmentLibraryName
        );
        TagService.initService(sp, this.properties.listTitle);
        UserService.initService(sp);

        setupAccessControl(this.context);

		initializeFileTypeIcons();
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
                                PropertyPaneTextField('listRootUrl', {
                                    label: strings.RootUrl,
                                }),
                                PropertyPaneTextField('listTitle', {
                                    label: strings.ListTitle,
                                }),
                                PropertyPaneTextField('settingListTitle', {
                                    label: strings.SettingListTitle,
                                }),
                                PropertyPaneTextField('attachmentLibraryName', {
                                    label: strings.AttachmentsLibraryTitle,
                                }),
                            ],
                        },
                        {
                            groupName: 'Permissions',
                            groupFields: [
                                AccessControl('permissions', {
                                    key: 'permissions',
                                    permissions: ['test-managers'],
                                    context: this.context,
                                    selectedUserGroups:
                                        this.properties.permissions,
                                }),
                            ],
                        },
                    ],
                },
            ],
        };
    }
}
