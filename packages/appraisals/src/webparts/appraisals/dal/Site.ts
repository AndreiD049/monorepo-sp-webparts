import { Caching, getNewSP, IContextInfo } from "sp-preset";

export async function getSiteInfo(): Promise<IContextInfo> {
    // Caching
    const sp = getNewSP();
    return await sp.site.getContextInfo();
}
