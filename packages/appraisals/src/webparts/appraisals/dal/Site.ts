import { sp } from "@pnp/sp";
import "@pnp/sp/sites";
import { IContextInfo } from "@pnp/sp/sites";

export async function getSiteInfo(): Promise<IContextInfo> {
    return await sp.site.usingCaching().getContextInfo();
}
