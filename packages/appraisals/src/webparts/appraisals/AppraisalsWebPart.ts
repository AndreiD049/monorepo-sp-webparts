import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
    IPropertyPaneConfiguration,
    PropertyPaneTextField,
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';

import * as strings from 'AppraisalsWebPartStrings';
import { IAppraisalsProps } from './components/periods/IAppraisalsProps';
import { sp } from '@pnp/sp/presets/all';
import Root from './components/Root';

export interface IAppraisalsWebPartProps {
    description: string;
}

export default class AppraisalsWebPart extends BaseClientSideWebPart<IAppraisalsWebPartProps> {
    public render(): void {
        /* Register live reload for Sharepoint Online */
        this.registerLiveReload();

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

    private registerLiveReload() {
      if (this.context.manifest["loaderConfig"]["internalModuleBaseUrls"][0]
                           .indexOf("https://localhost:4321") !== -1) {

        // create a new <script> element
        let script = document.createElement('script');
        // assign the src attribute to the livereload serve
        script.src = "//localhost:35729/livereload.js?snipver=1";
        // add script to the head section of the page
        document.head.appendChild(script);

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
                                PropertyPaneTextField('description', {
                                    label: strings.DescriptionFieldLabel,
                                }),
                            ],
                        },
                    ],
                },
            ],
        };
    }
}
