import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
    IPropertyPaneConfiguration,
    PropertyPaneCheckbox,
    PropertyPaneTextField,
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import SPBuilder, { InjectHeaders } from 'sp-preset';

import * as strings from 'AppraisalsWebPartStrings';
import Root, { IRootProps } from './components/Root';
import AccessControl, {
    IUserGroupPermissions,
    setupAccessControl,
} from 'property-pane-access-control';

export interface IAppraisalsWebPartProps {
    permissions: IUserGroupPermissions;
    showOnlyLastPeriod: boolean;
    defaultFolderRole: string;
    defaultSupportEmails: string;
}

export default class AppraisalsWebPart extends BaseClientSideWebPart<IAppraisalsWebPartProps> {
    static SPBuilder: SPBuilder;
    public render(): void {
        const element: React.ReactElement<IRootProps> = React.createElement(
            Root,
            {
                properties: this.properties,
            }
        );

        ReactDom.render(element, this.domElement);
    }

    protected async onInit(): Promise<void> {
        await super.onInit();

        AppraisalsWebPart.SPBuilder = new SPBuilder(this.context)
            .withRPM()
            .withAdditionalTimelines([
                InjectHeaders({
                    Accept: 'application/json;odata=nometadata',
                }),
            ]);

        setupAccessControl(this.context);
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
                            groupName: strings.GeneralGroupName,
                            groupFields: [
                                PropertyPaneCheckbox('showOnlyLastPeriod', {
                                    checked:
                                        this.properties.showOnlyLastPeriod ||
                                        false,
                                    text: strings.ShowOnlyLastPeriodDetailsLabel,
                                }),
                            ],
                        },
                        {
                            groupName: strings.BasicGroupName,
                            groupFields: [
                                AccessControl('permissions', {
                                    key: 'test',
                                    permissions: [
                                        'create',
                                        'lock',
                                        'finish',
                                        'manage-folders',
                                        'see-other-users',
                                    ],
                                    context: this.context,
                                    selectedUserGroups:
                                        this.properties.permissions,
                                }),
                            ],
                        },
                        {
                            groupName: strings.FolderManagementGroupName,
                            groupFields: [
                                PropertyPaneTextField('defaultFolderRole', {
                                    label: strings.DefaultFolderRoleLabel,
                                    description:
                                        strings.DefaultFolderRoleDescription,
                                }),
                                PropertyPaneTextField('defaultSupportEmails', {
                                    label: strings.SupportEmailsLabel,
                                    description:
                                        strings.SupportEmailsDescription,
                                }),
                            ],
                        },
                    ],
                },
            ],
        };
    }
}
