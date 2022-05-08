import { TimelinePipe } from "@pnp/core";

export interface ICacherConfig {
    exireFunction?: () => Date;
    keyFactory?: (url: string) => string;
}