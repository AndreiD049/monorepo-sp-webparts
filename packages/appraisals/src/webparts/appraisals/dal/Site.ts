import { Caching, IContextInfo } from "sp-preset";
import AppraisalsWebPart from "../AppraisalsWebPart";

export async function getSiteInfo(): Promise<IContextInfo> {
    const sp = AppraisalsWebPart.SPBuilder.getSP().using(Caching());
    return await sp.site.getContextInfo();
}
