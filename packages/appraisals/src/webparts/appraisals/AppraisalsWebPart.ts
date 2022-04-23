import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
    IPropertyPaneConfiguration,
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
    defaultFolderRole: string;
}

export default class AppraisalsWebPart extends BaseClientSideWebPart<IAppraisalsWebPartProps> {
    static SPBuilder: SPBuilder;
    public render(): void {
        const element: React.ReactElement<IRootProps> = React.createElement(
            Root,
            {
                permissions: this.properties.permissions,
                defaultFolderRole: this.properties.defaultFolderRole,
            }
        );

        ReactDom.render(element, this.domElement);
    }

    protected async onInit(): Promise<void> {
        await super.onInit();

        setupAccessControl(this.context);

        AppraisalsWebPart.SPBuilder = new SPBuilder(this.context)
            .withRPM()
            .withAdditionalTimelines([
                InjectHeaders({
                    Accept: 'application/json;odata=nometadata',
                }),
            ]);
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
                                AccessControl('permissions', {
                                    key: 'test',
                                    permissions: [
                                        'lock',
                                        'finish',
                                        'manage-folders',
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
                            ],
                        },
                    ],
                },
            ],
        };
    }
}
