import { TimelinePipe } from "@pnp/core";

export interface ICacherConfig {
    expireFunction?: () => Date;
    keyFactory?: (url: string) => string;
}