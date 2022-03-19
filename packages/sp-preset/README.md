# sp-preset

Convenient preset that make @pnp/sp version 3 usage more convenient

It is a slightly modified [version](https://pnp.github.io/pnpjs/concepts/project-preset/) of the preset method provided by [@pnp/sp](https://pnp.github.io/pnpjs/) authors, just packaged in a node module and made reusable so i don't have to write it every time.

# Usage

In order to work, the module needs to receive the `context` from your web-part. This is usually done in the `onInit` method:

```ts
import { setupSP } from 'sp-preset';

export default class MyWebPart extends BaseClientSideWebPart<ITasksWebPartProps> {
// ...
    protected async onInit(): Promise<void> {
        super.onInit();

        setupSP(this.context, {
            Data: "https://mytennant.sharepoint.com/sites/Site1",
            Users: "https://mytennant.sharepoint.com/sites/Site2",
            // and so on ...
        });
    }
// ...
}
```

Later in the application, when you need a specific instance of `spfi`:

```ts
import { getSP } from 'sp-preset';

// ...
const sp = getSP(); // get an instance of spfi
const spData = getSP('Data'); // get an instance of spfi that points to another tennant (it should be included in setup, see above)
// ...
```

Sometimes it's needed to receive an `spfi` object and use caching on it just in certain methods or classes. Just using `.getSP()` will not work as it would affect all methods using it, and as a result, everything will start getting cached. In this case we i can use `.getNewSP()` method, that will create and return a new instance of `spfi` so i can do whatever i want with it.

```ts
import { getNewSP } from 'sp-preset';
// ...

const spCached = getNewSP().using(Caching());
const spUsersCached = getNewSP('Users').using(Caching());
// ...
```

# Dependencies

The library does not include [version](https://pnp.github.io/pnpjs/concepts/project-preset/), and requires at least version 3.1.0 to be available in the project where it's imported.
