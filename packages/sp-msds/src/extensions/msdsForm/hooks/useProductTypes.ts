import * as React from "react";
import { LookupServiceCached } from "../services/lookup-service";
import { ITagWithData, LookupOptions } from "./types";

export function useProductTypes(): LookupOptions<string> {
    const [productTypes, setProductTypes] = React.useState<string[]>([]);
    const productTypeTags: ITagWithData<string>[] = React.useMemo(() => {
        return productTypes.map((ptype) => ({
            name: ptype,
            key: ptype,
            data: ptype,
        }));
    }, [productTypes]);

    React.useEffect(() => {
        async function run(): Promise<void> {
            setProductTypes(await LookupServiceCached.getAllProductTypes());
        }
        run().catch((err) => console.error(err));
    }, []);

    return {
        options: productTypes,
        set: setProductTypes,
        tags: productTypeTags,
    };
}