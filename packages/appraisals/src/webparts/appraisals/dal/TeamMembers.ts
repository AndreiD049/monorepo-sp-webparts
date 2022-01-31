import { sp } from '@pnp/sp';
import '@pnp/sp/webs';
import '@pnp/sp/lists';
import '@pnp/sp/items';
import { getCurrentUser, getUserById } from './Users';
import { getGroupUsers } from './Groups';
import { flatten, uniqBy } from '@microsoft/sp-lodash-subset';
import { IUser } from './IUser';

const LIST_TITLE = 'TeamLeaders';
const GROUP_CONTENTTYPE_PREFIX = '0x010B';
const USER_CONTENTTYPE_PREFIX = '0x010A';

export interface ITeamMember {
    UserId: string;
    TeamMembers: {
        Id: string;
        Title: string;
        ContentTypeId: string;
    }[];
}

/**
 * Get user's current team members
 * From list 'TeamLeaders'
 */
export async function getTeamMembers(): Promise<IUser[]> {
    const currentUser = await getCurrentUser();
    const items: ITeamMember[] = await sp.web.lists
        .getByTitle(LIST_TITLE)
        .items.filter(`UserId eq ${currentUser.Id}`)
        .select(
            'UserId',
            'TeamMembers/Id',
            'TeamMembers/Title',
            'TeamMembers/ContentTypeId'
        )
        .expand('TeamMembers')
        .usingCaching()
        .get();
    /*
     * if there are no users, means you are not allowed to see any other
     * users appraisals except your own
     */
    if (items.length === 0) {
        return [];
    }
    const users = items[0].TeamMembers.filter(
        (tm) => tm.ContentTypeId.indexOf(USER_CONTENTTYPE_PREFIX) === 0
    );
    const groups = items[0].TeamMembers.filter(
        (tm) => tm.ContentTypeId.indexOf(GROUP_CONTENTTYPE_PREFIX) === 0
    );
    const groupUsers = flatten(await Promise.all(groups.map(async (gr) => await getGroupUsers(gr.Id))));
    const calls = await Promise.all(users.map(async (user) => getUserById(user.Id)));
    return Promise.resolve(uniqBy(calls.concat(groupUsers), (x) => x.Id));
}
