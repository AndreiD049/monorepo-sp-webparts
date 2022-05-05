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
import "@pnp/sp/folders";
import "@pnp/sp/security";
import "@pnp/sp/views";
import "@pnp/sp/comments";
import RPMController from './controller';
import { ThrottlingDetector, IThrottlingDetectorProps } from './throttling-detector';

type TennantsType = {
    [name: string]: string;
};

export default class SPBuilder {
    private tennants: TennantsType = {};
    private timelinePipes: TimelinePipe[] = [];

    constructor(private context: any) { }

    withRPM(treshlod: number = 600, rpmTracing: boolean = false, rpmAlerting: boolean = true, onAlert?: (message: string) => void) {
        this.timelinePipes.push(RPMController(
            treshlod,
            this.context,
            rpmTracing,
            rpmAlerting,
            onAlert,
        ));
        return this;
    }

    withThrottlingControl(props: IThrottlingDetectorProps) {
        this.timelinePipes.push(ThrottlingDetector(props));
        return this;
    }

    withAdditionalTimelines(timelines: TimelinePipe[]) {
        this.timelinePipes = [...this.timelinePipes, ...timelines]
        return this;
    }

    withTennants(tennants: TennantsType) {
        this.tennants = tennants;
        return this;
    }

    getSP(key?: string) {
        if (!key) {
            return this.usingDefault(spfi());
        }
        return this.usingDefault(spfi(this.tennants[key]));
    }

    private usingDefault(sp: SPFI) {
        let result = sp.using(SPFx(this.context));
        this.timelinePipes.forEach((pipe) => result = result.using(pipe));
        return result;
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
    IBasePermissions,
    IRoleAssignment,
    PermissionKind,
    IRoleAssignmentInfo,
    IRoleAssignments,
    IRoleDefinitions,
    IRoleDefinitionUpdateResult,
    IRoleDefinitionInfo,
    IRoleDefinition,
    IRoleDefinitionAddResult,
} from '@pnp/sp/security';

export {
    IComment,
    ICommentAuthorData,
    ICommentInfo,
    IComments,
    ILikeData,
    ILikedByInformation,
    IReplies
} from '@pnp/sp/comments'

export {
    IFolder,
    IFolderAddResult,
    IFolderDeleteParams,
    IFolderInfo,
    IFolderParentInfos,
    IFolderUpdateResult,
    IFolders,
} from '@pnp/sp/folders';

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
    IGroupAddResult,
    ISiteGroup,
    ISiteGroupInfo,
    ISiteGroups,
    IGroupUpdateResult
} from '@pnp/sp/site-groups';

export {
    getHashCode,
    getGUID,
} from '@pnp/core';