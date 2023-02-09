import * as React from "react";
import { LookupService } from "../services/lookup-service";
import { ITagWithData, LookupOptions } from "./types";

export function useDatabases(site: string | undefined): LookupOptions<string> {
    const [dbs, setDbs] = React.useState<string[]>([]);
    const dbTags: ITagWithData<string>[] = React.useMemo(() => {
        return dbs.map((db) => ({
            name: db,
            key: db,
            data: db,
        }));
    }, [dbs]);

    React.useEffect(() => {
        async function run(): Promise<void> {
            if (!site && dbs.length === 0) {
                setDbs([]);
            } else if (site) {
                setDbs(await LookupService.getDatabases(site));
            }
        }
        run().catch((err) => console.error(err));
    }, [site]);

    return {
        options: dbs,
        set: setDbs,
        tags: dbTags,
    };
}
