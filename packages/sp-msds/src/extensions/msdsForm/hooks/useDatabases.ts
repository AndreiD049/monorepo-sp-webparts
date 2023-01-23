import * as React from "react";
import { IDatabase, LookupService } from "../services/lookup-service";
import { ITagWithData, LookupOptions } from "./types";

export function useDatabases(site: string | undefined): LookupOptions<IDatabase> {
    const [dbs, setDbs] = React.useState<IDatabase[]>([]);
    const dbTags: ITagWithData<IDatabase>[] = React.useMemo(() => {
        return dbs.map((db) => ({
            name: db.Title,
            key: db.Id,
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