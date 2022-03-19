# sp-preset

Convenient preset that make @pnp/sp version 3 usage more convenient

It is a slightly modified [version](https://pnp.github.io/pnpjs/concepts/project-preset/) of the preset method provided by [@pnp/sp](https://pnp.github.io/pnpjs/) authors, just packaged in a node module and made reusable so i don't have to write it every time.

# Setup

In order to work, the module needs to receive the `context` from your web-part. This is usually done in the `onInit` method:

```ts
import { setupSP } from 'sp-preset';

export default class MyWebPart extends BaseClientSideWebPart<ITasksWebPartProps> {
// ...
    protected async onInit(): Promise<void> {
        super.onInit();

        setupSP({
            // webpart context
            context: this.context,
            // additional tennants
            tennants: {
                Data: this.properties.dataSourceRoot,
                Users: userWebUrl,
            },
            // whether to use request frequency controller
            useRPM: true,
            // how many requests per minute are allowed by this controller
            rpmTreshold: 200,
            // save rpm trace (which urls were called and how many times) to localstorage
            rpmTracing: true,
            // alert user if number of request is exceeded and application is blocked
            rpmAlerting: true,
            // any additional Timelines to add to spfi
            additionalTimelinePipes: [
                InjectHeaders({
                    "Accept": "application/json;odata=nometadata"
                }),
            ],
        });
    }
// ...
}
```

# Usage

Later in the application, when you need a specific instance of `spfi`:

```ts
import { getSP } from 'sp-preset';

// ...
const sp = getSP(); // get an instance of spfi
const spData = getSP('Data'); // get an instance of spfi that points to another tennant (it should be included in setup, see above)
// ...
```

Sometimes it's needed to receive an `spfi` object and use [caching](https://pnp.github.io/pnpjs/queryable/behaviors/#caching) on it just in certain methods or classes. Just using `.getSP()` will not work as it would affect all methods using it, and as a result, everything will start getting cached. In this case we i can use `.getNewSP()` method, that will create and return a new instance of `spfi` so i can do whatever i want with it.

```ts
import { getNewSP } from 'sp-preset';
// ...

const spCached = getNewSP().using(Caching());
const spUsersCached = getNewSP('Users').using(Caching());
// ...
```

# RPM (request per minute control) Control

The Request Frequency controller or RPMController is just a custom Timeline that controlls how many api calls per minute the webpart is doing. Each webpart can have different treshold of api calls.

If the treshold is reached, the application is blocked (there is a property saved to localstorage that indicates this).

This is done in order to avoid misuse or [throttling](https://docs.microsoft.com/en-us/sharepoint/dev/general-development/how-to-avoid-getting-throttled-or-blocked-in-sharepoint-online) of the application. 

Worst case would be if because of a mistake or some misconfiguration, the webpart starts calling some api uncontrollingly and user just ignores or doesn't notice it. Then the application/user or tennant can be just blocked by Microsoft.

In order to turn on request frequency control, just pass the appropriate properties into [setup](#setup).

# Dependencies

The library does not include [version](https://pnp.github.io/pnpjs/concepts/project-preset/), and requires at least version 3.1.0 to be available in the project where it's imported.
