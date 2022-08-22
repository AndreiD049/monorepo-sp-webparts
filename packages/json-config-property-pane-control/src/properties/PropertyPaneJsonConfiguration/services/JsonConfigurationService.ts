/** Source: https://www.vrdmn.com/2019/03/using-service-scopes-to-decouple.html */

import { ServiceScope } from '@microsoft/sp-core-library';
import { SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http';
import { PageContext } from '@microsoft/sp-page-context';

export default class JsonConfigurationService {
    private static _spHttpClient: SPHttpClient;
    private static _pageContext: PageContext;
    private static _currentWebUrl: string;

    public static OnInit(serviceScope: ServiceScope): void {
        serviceScope.whenFinished(() => {
            this._spHttpClient = serviceScope.consume(SPHttpClient.serviceKey);

            this._pageContext = serviceScope.consume(PageContext.serviceKey);
            this._currentWebUrl = this._pageContext.web.absoluteUrl;
        });
    }

    public static async getFileContents(path: string): Promise<JSON> {
        const result = await this._spHttpClient.get(`${this._currentWebUrl}/_api/web/GetFileByServerRelativeUrl('${path}')/$value`, SPHttpClient.configurations.v1);
        if (result.status < 210) {
            return result.json();
        } else {
            throw (await result.json()).error.message;
        }
    }
}
