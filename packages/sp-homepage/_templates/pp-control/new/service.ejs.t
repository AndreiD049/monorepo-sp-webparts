---
to: src/properties/PropertyPane<%= Name %>/services/<%= Name %>Service.ts
---
/** Source: https://www.vrdmn.com/2019/03/using-service-scopes-to-decouple.html */

import { ServiceKey, ServiceScope } from '@microsoft/sp-core-library';
import { SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http';
import { PageContext } from '@microsoft/sp-page-context';

export interface I<%= Name %>Service {
    getWebDetails(): Promise<JSON>;
}

export class <%= Name %>Service implements I<%= Name %>Service {

    public static readonly serviceKey: ServiceKey<I<%= Name %>Service> =
        ServiceKey.create<<%= Name %>Service>('my-custom-app:I<%= Name %>Service', <%= Name %>Service);

    private _spHttpClient: SPHttpClient;
    private _pageContext: PageContext;
    private _currentWebUrl: string;

    constructor(serviceScope: ServiceScope) {
        serviceScope.whenFinished(() => {
            this._spHttpClient = serviceScope.consume(SPHttpClient.serviceKey);

            this._pageContext = serviceScope.consume(PageContext.serviceKey);
            this._currentWebUrl = this._pageContext.web.absoluteUrl;
        });
    }

    public getWebDetails(): Promise<JSON> {
        return this._spHttpClient.get(`${this._currentWebUrl}/_api/web`, SPHttpClient.configurations.v1).then((response: SPHttpClientResponse) => {
            return response.json();
        });
    }
}
