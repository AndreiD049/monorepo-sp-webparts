import * as React from "react";
import { LookupServiceCached } from "../services/lookup-service";
import { ITagWithData, LookupOptions } from "./types";

export function useHazardousGoodsCodes(): LookupOptions<string> {
    const [codes, setCodes] = React.useState<string[]>([]);
    const codeTags: ITagWithData<string>[] = React.useMemo(() => {
        return codes.map((code) => ({
            name: code,
            key: code,
            data: code,
        }));
    }, [codes]);

    React.useEffect(() => {
        async function run(): Promise<void> {
            setCodes(await LookupServiceCached.getAllHazardousGoodsCode());
        }
        run().catch((err) => console.error(err));
    }, []);

    return {
        options: codes,
        set: setCodes,
        tags: codeTags,
    };
}