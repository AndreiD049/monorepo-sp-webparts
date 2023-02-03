import * as React from "react";
import { IApprovers, LookupService } from "../services/lookup-service";
import {  LookupOptions } from "./types";

export function useApprovers(site: string | undefined): LookupOptions<IApprovers> {
    const [approvers, setApprovers] = React.useState<IApprovers[]>([]);

    React.useEffect(() => {
        async function run(): Promise<void> {
            if (!site && approvers.length === 0) {
                setApprovers([]);
            } else if (site) {
                setApprovers(await LookupService.getApproversByLocation(site));
            }
        }
        run().catch((err) => console.error(err));
    }, [site]);

    return {
        options: approvers,
        set: setApprovers,
        tags: null,
    };
}