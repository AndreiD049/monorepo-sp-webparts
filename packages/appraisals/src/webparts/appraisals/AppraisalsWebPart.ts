import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import { IPropertyPaneConfiguration } from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';

import * as strings from 'AppraisalsWebPartStrings';
import { IAppraisalsProps } from './components/periods/IAppraisalsProps';
import { sp } from '@pnp/sp/presets/all';
import Root from './components/Root';
import AccessControl, { IUserGroupPermissions } from 'property-pane-access-control';

export interface IAppraisalsWebPartProps {
    permissions: IUserGroupPermissions;
}

export default class AppraisalsWebPart extends BaseClientSideWebPart<IAppraisalsWebPartProps> {
    public render(): void {
        const element: React.ReactElement<IAppraisalsProps> =
            React.createElement(Root);

        ReactDom.render(element, this.domElement);
    }

    protected async onInit(): Promise<void> {
        await super.onInit();

        sp.setup({
            spfxContext: this.context,
            defaultCachingStore: 'session',
            defaultCachingTimeoutSeconds: 600,
            globalCacheDisable: false,
        });
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
                                    permissions: ['lock', 'finish'],
                                    context: this.context,
                                    selectedUserGroups: this.properties.permissions,
                                }),
                            ],
                        },
                    ],
                },
            ],
        };
    }
}
