import { spfi, SPFI, SPFx } from '@pnp/sp';
import { TimelinePipe } from '@pnp/core';
import '@pnp/sp/webs';
import '@pnp/sp/lists';
import '@pnp/sp/items';
import '@pnp/sp/batching';
import '@pnp/sp/fields';
import '@pnp/sp/site-users/web';
import '@pnp/sp/site-groups';
import '@pnp/sp/sites';
import RPMController from './controller';

var options: ISPOptions | null = null;

type TennantsType = {
    [name: string]: string;
};

interface ISetup {
    context: any;
    tennants?: TennantsType;
    useRPM?: boolean;
    rpmTreshold?: number;
    rpmTracing?: boolean;
    rpmAlerting?: boolean;
    additionalTimelinePipes?: TimelinePipe[]
};

interface ISPOptions extends ISetup {
    tennants: TennantsType;
    controller?: any;
}


export const setupSP = (opts: ISetup): void => {
    options = {
        tennants: {},
        ...opts,
    };
    if (options.useRPM) {
        options.controller = RPMController(
            options.rpmTreshold || 1000, 
            options.context, 
            options.rpmTracing, 
            options.rpmAlerting
        );
    }
};

export const getSP = (key?: string): SPFI => {
    checkSetupDone();
    if (!key) {
        return usingDefault(spfi());
    }
    if (options!.context === null) throw Error('Setup was not called');
    if (!(key in options!.tennants)) throw Error(`No '${key}' in tennants. Check your setup or key. Avilable options are: ${Object.keys(options!.tennants).join(', ')}`);
    return usingDefault(spfi(options!.tennants[key]));
}

function usingDefault(sp: SPFI): SPFI {
    checkSetupDone();
    let result = sp.using(SPFx(options!.context));
    if (options?.useRPM) {
        result = result.using(options.controller);
    }
    if (options!.additionalTimelinePipes?.length) {
        options!.additionalTimelinePipes.forEach((timeline) => result = result.using(timeline));
    }
    return result;
}

function checkSetupDone() {
    if (options === null || !options.context) {
        throw new Error('Setup was not done or done inproperly.');
    }
}

//Export usual stuff from sp
export {
    SPFI,
} from '@pnp/sp';

export { 
    IContextInfo, 
    ISite 
} from '@pnp/sp/sites';

export {
    ISiteUserInfo,
    ISiteUser,
    ISiteUsers,
    IUserUpdateResult,
} from '@pnp/sp/site-users/types';

export {
    DateTimeFieldFriendlyFormatType,
    DateTimeFieldFormatType,
    CalendarType,
    ChoiceFieldFormatType,
    IField,
    IFieldAddResult,
    IFieldInfo,
    IFieldUpdateResult,
    IFields,
    IFieldCreationProperties,
} from '@pnp/sp/fields';

export {
    IWeb,
    Web,
    IWebs,
    Webs,
} from "@pnp/sp/webs";

export {
    ILists,
    List,
    IList,
    Lists,
    IListAddResult,
    IListUpdateResult,
} from "@pnp/sp/lists";

export {
    IItems,
    IItem,
    Item,
    Items,
    IItemAddResult,
    IItemUpdateResult,
} from "@pnp/sp/items";

export {
    Caching,
    InjectHeaders,
} from '@pnp/queryable';

export {
    getHashCode,
    getGUID,
} from '@pnp/core';