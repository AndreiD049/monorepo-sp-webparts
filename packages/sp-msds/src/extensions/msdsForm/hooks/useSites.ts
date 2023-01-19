import * as React from "react";
import { LookupServiceCached } from "../services/lookup-service";
import { ITagWithData, LookupOptions } from "./types";

export function useSites(): LookupOptions<string> {
    const [sites, setSites] = React.useState<string[]>([]);
    const sitesTags: ITagWithData<string>[] = React.useMemo(() => {
        return sites.map((site) => ({
            name: site,
            key: site,
            data: site,
        }));
    }, [sites]);

    React.useEffect(() => {
        async function run(): Promise<void> {
            setSites(await LookupServiceCached.getAllSites());
        }
        run().catch((err) => console.error(err));
    }, []);

    return {
        options: sites,
        set: setSites,
        tags: sitesTags,
    };
}