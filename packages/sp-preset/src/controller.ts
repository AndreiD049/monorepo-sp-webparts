import { Queryable } from "@pnp/queryable";

type TraceDict = {
    [url: string]: number;
};

export default function RPMController(treshold: number, context: any, tracing: boolean = false, alerting: boolean = false, onAlert?: (message: string) => void) {
    const MINUTE = 1000 * 60;
    let count = 0;
    let firstCall = Date.now();
    let trace: TraceDict = {};
    const key = context.manifest.id + context.manifest.version;
    let blocked = JSON.parse(localStorage.getItem(key) || 'false');
    let notified = false;

    const alertUser = () => {
        const alertFunc = onAlert ?? alert;
        if (alerting && !notified) {
            alertFunc(`Application ${context.manifest.alias} was blocked because it exceeded maximum amount of requests. Please contact support.`)
            notified = true;
        } 
    }

    return (instance: Queryable ) => {

        instance.on.pre(async (url: string, init: RequestInit, result: any) => {
            if (blocked) {
                alertUser();
                return [url, init, null];
            }
            const current = Date.now();
            if (current - firstCall > MINUTE) {
                count = 0;
                firstCall = current;
                if (tracing) trace = {};
            } else {
                count += 1;
                if (tracing) trace[url] = (trace[url] || 0) + 1;
            }
            if (count > treshold) {
                localStorage.setItem(key, 'true');
                localStorage.setItem(`Trace:${key}`, JSON.stringify(tracing ? trace : '', null, 4));
                blocked = true;
                alertUser();
                throw Error(`Too many requests! Application blocked`);
            }
            return [url, init, result];
        });
        return instance;
    }
}