import { IncSyncConfig } from "../../features/incremental-sync";

export const DB_NAME = 'Spfx_Feedback';
export const STORE_NAME = `${location.origin}/${location.pathname}`;

export const NULL = 'null';

export const SECOND = 1000;
export const MINUTE = SECOND * 60;
export const HOUR = MINUTE * 60;

export const MAIN_PANEL = 'SpfxFedbackPanel';
export const MAIN_CALLOUT = 'SpfxFedbackCallout';
export const DIALOG_ID = 'spfxFeedbackDialog';

// TAGS
// Items tagged with this appear in the dropdowns
export const APPLICATION = 'FB:/Application';
// Items tagged with this appear in the dropdowns
export const ENVIRONMENT = 'FB:/Environment';
// Items tagged with this appear in the dropdowns
export const CATEGORY = 'FB:/Category';
// Items tagged with this are perceived as feedback items
export const FEEDBACK = 'FB:/Feedback';
// Items tagged with this appear in the choice/dropdown for status field
export const TEMPLATE = 'FB:/Template';
export const SAVED_VIEW = 'FB:/Saved_View';
export const SELECTED_VIEW = 'SELECTED_VIEW';
export const EDITABLE_ITEMS = 'FB:/State/Editable';
export const FORM_FIELD_SETUP = 'FB:/FORM_FIELD_SETUP';

// An item with the title 'FB:/FIELD_VALUES' can be created with
// fields and their corresponding values as an array
// For ex: {
//  "status": ["New", "In-Progress", "Cancelled", "Finished", "Abandoned"],
// }
export const FIELD_VALUES = 'FB:/FIELD_VALUES';

export const ADMINS = 'FB:/Administrators';

// Drag & Drop item types
export const ITEM_TYPES = {
    Item: 'Item',
};

export const INCREMENTAL_SYNC_CONFIG: IncSyncConfig = {
    dbName: 'SPFX-FeedbackItems',
    tokenStoreName: 'SpfxToken',
    dataStoreName: 'SpfxItems',
    fields: [
        {
            field: 'ID',
            type: 'Number',
            key: 'Id',
        },
        {
            field: 'Title',
            type: 'String',
        },
        {
            field: 'Fields',
            type: 'String',
        },
        {
            field: 'Author',
            type: 'Person',
        },
        {
            field: 'Created',
            type: 'String',
        },
        {
            field: 'Tags',
            type: 'List',
        },
        {
            field: 'IsService',
            type: 'Boolean',
        },
    ],
    dataKeyField: 'Id',
};
