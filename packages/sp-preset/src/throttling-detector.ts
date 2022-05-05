import { delay, TimelinePipe } from '@pnp/core';
import { HttpRequestError, Queryable } from '@pnp/queryable';

export interface IThrottlingDetectorProps {
    replace?: boolean;
    defaultWait?: number;
    onThrottlingAlert?: (wait: number) => void;
}

/**
 * This is a slightly modified version of original pnpjs version
 * source: https://github.com/pnp/pnpjs/blob/a9b15c4a8f517d99a14e626f2494bd8549435536/packages/queryable/behaviors/browser-fetch.ts
 */
export function ThrottlingDetector(
    props?: IThrottlingDetectorProps
): TimelinePipe<Queryable> {
    const {
        defaultWait: interval,
        replace,
        retries,
        onThrottlingAlert,
    } = {
        replace: true,
        defaultWait: 500,
        retries: 1,
        onThrottlingAlert: (_wait: number) => {},
        ...props,
    };

    let isThrottled = false;
    let wait = interval;

    return (instance: Queryable) => {
        if (replace) {
            instance.on.send.clear();
        }

        instance.on.send(async function (
            url: URL,
            init: RequestInit
        ): Promise<Response> {
            let response: Response;

            try {
                if (isThrottled) {
                    // Let the user know
                    onThrottlingAlert(wait);

                    throw Error(
                        'Application is being throttled. Please wait a little bit.'
                    );
                }

                const u = url.toString();
                response = await fetch(u, init);

                if (
                    !response.ok &&
                    (response?.status === 429 ||
                        response?.status === 503 ||
                        response?.status === 504)
                ) {
					if (response.headers.has("Retry-After")) {

                            // if we have gotten a header, use that value as the delay value in seconds
                            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
						wait += parseInt(response.headers.get("Retry-After")!, 10) * 1000;
					} else {
						wait *= 2;
					}
                    isThrottled = true;
                    // Let the user know
                    onThrottlingAlert(wait);
                }

                // this the the first call to retry that starts the cycle
                // response is undefined and the other values have their defaults
                return response;
            } catch (err) {
                throw err;
            }
        });

        return instance;
    };
}
