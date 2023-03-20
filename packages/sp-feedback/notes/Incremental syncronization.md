# What?

The idea is to keep all the items from a list locally in indexeddb, and only sync changes that happen over time.
This can be done using `getListItemChangesSinceToken` api. (see (docs)[https://pnp.github.io/pnpjs/sp/items/#getlistitemchangessincetoken]).

# How?

1. Provide a url to a list and some [config object]
2. Check `tokenStore` to see if we have a token. 
3. Check the list items to see if we have any items.
4. If no token or no items, pull the whole list and save it to indexedDb
5. If we have a token, pull the changes since token
6. Apply pulled changes to the local list of items
7. Resolve, letting the user know that the list was synced

# Config object

```
{
    dbName: string;
    tokenStoreName: string;
    dataStoreName: string;
}
```

# Implementation breakdown
1. Provide a url to a list and some [config object]
    - validate the [config object]
2. Do we have a token or existing items that we can apply the changes to?
    - Pull the token from the token store.
    - Check if there are items in the items store

3. If no token or no items, pull the whole list and save it to indexedDb
                                                                  |   
4. If we have a token, pull the changes since token               |
5. Apply pulled changes to the local list of items                |
|                                                                 |
|___6. Resolve, letting the user know that the list was synced____|
