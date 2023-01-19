import * as React from "react";
import { LookupOptions } from "./types";

export function useMaterialTypes(): LookupOptions<string> {
    const [types, setTypes] = React.useState(["Finished goods", "Raw material", "Packaging material"])

    return {
        options: types,
        set: setTypes,
        tags: types.map((t) => ({
            name: t,
            key: t,
            data: t,
        })),
    };
}