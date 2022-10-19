import UserService from './Users';
import ManageFolderService from '../components/folders/folder-service';

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
    const folderService = new ManageFolderService();
    const folders = await folderService.getUserFolders();
    const siteUsers = await userService.getSiteUsers();
    const teamMembers = folders.map((f) => siteUsers.find((u) => u.Title === f.Title));

    return teamMembers;
}
