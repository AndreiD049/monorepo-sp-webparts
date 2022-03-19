import { Queryable } from "@pnp/queryable";

type TraceDict = {
    [url: string]: number;
};

export default function RPMController(treshold: number, context: any, tracing: boolean = false, alerting: boolean = false) {
    const MINUTE = 1000 * 60;
    let count = 0;
    let firstCall = Date.now();
    let trace: TraceDict = {};
    const key = context.manifest.id + context.manifest.version;
    let blocked = JSON.parse(localStorage.getItem(key) || 'false');
    return (instance: Queryable ) => {

        instance.on.post(async (url: URL, result: any) => {
            if (blocked) {
                if (alerting) alert(`Application ${context.manifest.alias} was blocked because it exceeded maximum amount of requests. Please contact support.`)
                throw Error(`Application blocked`);
            }
            const current = Date.now();
            if (current - firstCall > MINUTE) {
                count = 0;
                firstCall = current;
                if (tracing) trace = {};
            } else {
                count += 1;
                if (tracing) trace[url.pathname] = (trace[url.pathname] || 0) + 1;
            }
            if (count > treshold) {
                localStorage.setItem(key, 'true');
                localStorage.setItem(`Trace:${key}`, JSON.stringify(tracing ? trace : '', null, 4));
                blocked = true;
                throw Error(`Too many requests! Application blocked`);
            }
            return [url, result];
        });
        return instance;
    }
}