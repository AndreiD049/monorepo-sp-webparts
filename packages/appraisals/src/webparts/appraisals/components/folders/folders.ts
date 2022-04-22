import { clone } from '@microsoft/sp-lodash-subset';
import { Caching, getHashCode, IFolderInfo, IList, IRoleDefinitionInfo, ISiteUserInfo, SPFI } from 'sp-preset';
import { Queryable } from 'sp-preset/node_modules/@pnp/queryable';
import AppraisalsWebPart from '../../AppraisalsWebPart';
import { LIST_NAME } from '../../dal/Items';
import UserService from '../../dal/Users';
import IUserFolder from './IFolder';

const LIST_SELECT = ['GUID', 'Id', 'Title'];
const MINUTE = 1000 * 60;

export default class ManageFolderService {
    private sp: SPFI;
    private list: IList;
    private userService: UserService;
    private userList: ISiteUserInfo[];
    private userSet: Set<string>;
    private userMap: Map<number, ISiteUserInfo>;
    private roleDefinitions: IRoleDefinitionInfo[];
    private cacheKeys: { [id: number]: string };

    constructor() {
        this.cacheKeys = {};
        this.sp = AppraisalsWebPart.SPBuilder.getSP().using(Caching({
            keyFactory: (url) => url,
            expireFunc: () => new Date(Date.now() + MINUTE * 5),
        }));
        this.list = this.sp.web.lists.getByTitle(LIST_NAME);
        this.userService = new UserService();
    }

    /**
     * Make sure that we have user info
     */
    async ensureUserAndRoleDefinitionInfo() {
        if (!this.userList) {
            this.userList = await this.userService.getSiteUsers();
            this.userSet = new Set(this.userList.map((user) => user.Title));
            this.userMap = new Map(this.userList.map((user) => [user.Id, user]));
            this.roleDefinitions = await this.sp.web.roleDefinitions();
        }
    }

    async getFolder(folderId: number): Promise<IUserFolder> {
        return this.list.items.getById(folderId).select(...LIST_SELECT)();
    }

    /**
     * Get only folders that have title matching with user names
     * @returns list of folders
     */
    async getUserFolders(): Promise<IUserFolder[]> {
        await this.ensureUserAndRoleDefinitionInfo();
        const query = `ContentType eq 'Folder'`;
        const folders: IUserFolder[] = await this.list.items.filter(query).select(...LIST_SELECT)();
        return folders.filter((folder) => this.userSet.has(folder.Title));
    }

    /**
     * Given a UserFolder list, populates the list of users in it
     * @param folders UserFolder array
     * @returns returns same UserFolder array but with users populated
     */
    async populateUserInfo(folders: IUserFolder[]): Promise<IUserFolder[]> {
        await this.ensureUserAndRoleDefinitionInfo();
        const [batchedSP, execute] = this.sp.batched();
        const result = clone(folders);
        const batchedList = batchedSP.web.lists.getByTitle(LIST_NAME);
        const calls = result.map(async (folder) => {
            const assignements = await batchedList.items.getById(folder.Id).roleAssignments();
            folder.Users = assignements.map((u) => this.userMap.get(u.PrincipalId)).filter((u) => Boolean(u));
        });
        await execute();
        await Promise.all(calls);
        return result;
    }

    /**
     * Tells us whether the folder has broken permissions already
     * @param folderId id of the folder to inspect
     * @returns whether folder has broken permissions or not
     */
    async hasFolderBrokenInheritance(folderId: number): Promise<boolean> {
        const folder = await this.getFolder(folderId);
        const firstUniqueAncestor = await this.list.items.getById(folderId).firstUniqueAncestorSecurableObject();
        return folder.GUID === firstUniqueAncestor.GUID;
    }

    /**
     * Adds a specific user access to a folder
     * @param userId 
     * @param folderId 
     * @param roleDefinition the name of the role definition, example 'Edit', or 'Contribute'
     */
    async assignUserToFolder(userId: number, folderId: number, roleDefinition: string) {
        await this.assertUserId(userId);
        await this.assertFolderId(folderId);
        const folder = this.list.items.getById(folderId);
        if (!this.hasFolderBrokenInheritance(folderId)) {
            await folder.breakRoleInheritance();
        }
        await this.assertRoleDefintion(roleDefinition);
        const foundRole = this.roleDefinitions.find((role) => role.Name === roleDefinition);
        this.invalidateCache(folder.roleAssignments.toRequestUrl());
        await folder.roleAssignments.add(userId, foundRole.Id);
    }

    /**
     * Removes user access from folder
     * @param userId 
     * @param folderId 
     * @param roleDefinition
     */
    async removeUserFromFolder(userId: number, folderId: number, roleDefinition: string) {
        await this.assertUserId(userId);
        await this.assertFolderId(folderId);
        const folder = this.list.items.getById(folderId);
        await this.assertRoleDefintion(roleDefinition);
        const foundRole = this.roleDefinitions.find((role) => role.Name === roleDefinition);
        this.invalidateCache(folder.roleAssignments.toRequestUrl());
        folder.roleAssignments.remove(userId, foundRole.Id);
    }

    private async assertUserId(userId: number) {
        await this.ensureUserAndRoleDefinitionInfo();
        if (!this.userMap.has(userId)) {
            throw Error(`Unknown user with id ${userId}`);
        }
    }

    private async assertFolderId(folderId: number) {
        await this.ensureUserAndRoleDefinitionInfo();
        const folder: { ContentType: string } = await this.list.items.getById(folderId)();
        if (folder.ContentType !== 'Folder') {
            throw Error(`There is no folder with id ${folderId}`);
        }
    }

    private async assertRoleDefintion(roleName: string) {
        await this.ensureUserAndRoleDefinitionInfo();
        const foundRole = this.roleDefinitions.find((role) => role.Name === roleName);
        if (!foundRole) {
            throw Error(`Role definition '${roleName}' was not found`);
        }
    }

    private invalidateCache(url: string) {
        for (let i = 0; i < localStorage.length; i++) {
            const element = localStorage.key(i);
            if (element.endsWith(url)) {
                localStorage.removeItem(element);
            }
        }
    }
}
