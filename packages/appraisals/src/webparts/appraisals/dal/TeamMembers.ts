import { flatten, uniqBy } from '@microsoft/sp-lodash-subset';
import { IUser } from './IUser';
import { Caching } from 'sp-preset';
import GroupService from './Groups';
import UserService from './Users';
import AppraisalsWebPart from '../AppraisalsWebPart';
import { intersectionBy } from 'lodash';
import ItemService, { LIST_NAME } from './Items';

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
 * This is basically the list of folders from Appraisal Items
 * that match site user names
 * If user doesn't need to have access to another user, he shouldn't have access to folder
 */
export async function getTeamMembers() {
    const userService = new UserService();
    const sp = AppraisalsWebPart.SPBuilder.getSP().using(Caching());
    const folders = (await sp.web.lists.getByTitle(LIST_NAME).rootFolder.folders()).map((folder) => folder.Name);
    const siteUsers = await userService.getSiteUsers();
    const teamMembers = intersectionBy(siteUsers, folders, (t) => typeof t === 'string' ? t : t.Title);

    return teamMembers;
}
