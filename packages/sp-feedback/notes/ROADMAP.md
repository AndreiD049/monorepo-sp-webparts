# Still to be implemented

-   [x] Add tags to the item template.
        `       When clicking on a tag, it should show a list of items that also have that tag.
When clicking on an item, it should show up in a modal window.`
-   [x] Board view, with drag and drop (see: https://react-dnd.github.io/react-dnd/docs/tutorial#adding-drag-and-drop-interaction)
-   [x] Implement a modal window to display an item (usually when clicking on a link)
-   [ ] Improve the UI of creating and new item
-   [ ] Document the difference Item types (like 'FB:/Application' or 'FB:/Saved_View') and explain their purpose
-   [ ] Support attachments with the feedback item. How can i then display attachments in the item template
-   [ ] Send notifications when an item gains a certain status (ex: _Implemented_ or _Finished_)

# Azure dev ops integration

Azure dev ops integration is supposed to sync the status and other details of an azure item (PBI or bug) into feedback items. Say i specified that `feedback A` is linked to `PBI X`, then it will pull out some details about the `PBI X`, like Title, Status, etc...
Now, if status of `PBI X` changed, next time i open the feedback app, this status will be synchronized.

## Performance considerations

Doing an API call for every dev ops item on every refresh is probably dumb. So we can cache statuses for a certain amount of time and say: `OK, last time i checked the status only 5 minutes ago, it probably didn't change, so i will not call the API now` then after some time `last time i checked the status 15 minutes ago, it's probably time to check if it changed` (then call the API). I can use `idb-proxy` for that.

## Features

What i need to have/know in order to implement those features:

-   Given an azure item id, i should be able to extract the info from azure dev ops via API.

    -   Step 1. Create a test azure dev ops item (Done)
    -   Step 2. Do a basic API call to azure (Done)
    -   Step 3. Organize the code into a static service

-   Given an index-manager, i should be able to extract the Personal Access Token from it.
-   Given an index-manager, i should be able to check if Azure dev ops integration is on. (meaning if i have a PAT set)
