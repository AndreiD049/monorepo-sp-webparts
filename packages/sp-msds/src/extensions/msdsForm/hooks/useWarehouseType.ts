import * as React from "react";
import { LookupServiceCached } from "../services/lookup-service";
import { ITagWithData, LookupOptions } from "./types";

export function useWarehouseTypes(): LookupOptions<string> {
    const [whtypes, setWhTypes] = React.useState<string[]>([]);
    const whTypeTags: ITagWithData<string>[] = React.useMemo(() => {
        return whtypes.map((whtype) => ({
            name: whtype,
            key: whtype,
            data: whtype,
        }));
    }, [whtypes]);

    React.useEffect(() => {
        async function run(): Promise<void> {
            setWhTypes(await LookupServiceCached.getAllWarehouseTypes());
        }
        run().catch((err) => console.error(err));
    }, []);

    return {
        options: whtypes,
        set: setWhTypes,
        tags: whTypeTags,
    };
}