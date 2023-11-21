import { clone } from '@microsoft/sp-lodash-subset';
import {
    Caching,
    IList,
    IRoleDefinitionInfo,
    ISiteUserInfo,
    SPFI,
} from 'sp-preset';
import AppraisalsWebPart from '../../AppraisalsWebPart';
import { LIST_NAME } from '../../dal/Items';
import UserService from '../../dal/Users';
import IUserFolder from './IFolder';

const LIST_SELECT = ['GUID', 'Id', 'Title'];
const MINUTE = 1000 * 60;

export default class ManageFolderService {
    private sp: SPFI;
    private cachedSP: SPFI;
    private list: IList;
    private userService: UserService;
    private userList: ISiteUserInfo[];
    private userSet: Set<string>;
    private userMap: Map<number, ISiteUserInfo>;
    private roleDefinitions: IRoleDefinitionInfo[];
    private parentWebUrl: string;
    private listTitle: string;

    constructor(private defaultRole?: string) {
        this.cachedSP = AppraisalsWebPart.SPBuilder.getSP(AppraisalsWebPart.RootUrl).using(
            Caching({
                keyFactory: (url) => url,
                expireFunc: () => new Date(Date.now() + MINUTE * 5),
            })
        );
        this.sp = AppraisalsWebPart.SPBuilder.getSP(AppraisalsWebPart.RootUrl);
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
            this.userMap = new Map(
                this.userList.map((user) => [user.Id, user])
            );
            this.roleDefinitions = await this.cachedSP.web.roleDefinitions();
            const listInfo = await this.list.select('Title', 'ParentWebUrl')();
            this.parentWebUrl = listInfo.ParentWebUrl;
            this.listTitle = listInfo.Title;
        }
    }

    async createUserFolder(name: string) {
        await this.ensureUserAndRoleDefinitionInfo();
        await this.sp.web.getFolderByServerRelativePath(`${this.parentWebUrl}/Lists/${this.listTitle}`).addSubFolderUsingPath(name);
        const folder = (await this.list.items.filter(`ContentType eq 'Folder' and Title eq '${name}'`)())[0];
        const added = this.list.items.getById(folder.Id);
        // Break inheritance
        await added.breakRoleInheritance();
        const user = this.userList.find((u) => u.Title === name);
        const item: {Id: number} = await added();
        // Add access to the user himself
        await this.assignUserToFolder(user.Id, item.Id, this.defaultRole);
        return item.Id;
    }

    async getFolder(folderId: number): Promise<IUserFolder> {
        await this.ensureUserAndRoleDefinitionInfo();
        const result: IUserFolder = await this.list.items
            .getById(folderId)
            .select(...LIST_SELECT)();
        result.folderUser = this.userList.find((u) => u.Title === result.Title);
        return result;
    }

    async getCurrentUserFolder(): Promise<IUserFolder> {
        const currentUser = await this.userService.getCurrentUser();
        const query = `ContentType eq 'Folder' and Title eq '${currentUser.Title}'`;
        const folders = await this.list.items.filter(query).select(...LIST_SELECT)();
        return folders[0];
    }

    /**
     * Get only folders that have title matching with user names
     * @returns list of folders
     */
    async getUserFolders(): Promise<IUserFolder[]> {
        await this.ensureUserAndRoleDefinitionInfo();
        const query = `ContentType eq 'Folder'`;
        const folders: IUserFolder[] = (
            await this.list.items.filter(query).select(...LIST_SELECT).top(300)()
        ).map((folder: IUserFolder) => {
            folder.folderUser = this.userList.find(
                (u) => u.Title === folder.Title
            );
            return folder;
        });
        return folders.filter((folder) => this.userSet.has(folder.Title));
    }

    /**
     * Given a UserFolder list, populates the list of users in it
     * @param folders UserFolder array
     * @returns returns same UserFolder array but with users populated
     */
    async populateUserInfo(folders: IUserFolder[]): Promise<IUserFolder[]> {
        await this.ensureUserAndRoleDefinitionInfo();
        const [batchedSP, execute] = this.cachedSP.batched();
        const result = clone(folders);
        const batchedList = batchedSP.web.lists.getByTitle(LIST_NAME);
        const calls = result.map(async (folder) => {
            const assignements = await batchedList.items
                .getById(folder.Id)
                .roleAssignments();
            folder.Users = assignements
                .map((u) => this.userMap.get(u.PrincipalId))
                .filter((u) => Boolean(u));
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
        const firstUniqueAncestor = await this.list.items
            .getById(folderId)
            .firstUniqueAncestorSecurableObject();
        return folder.GUID === firstUniqueAncestor.GUID;
    }

    /**
     * Adds a specific user access to a folder
     * @param userId
     * @param folderId
     * @param roleDefinition the name of the role definition, example 'Edit', or 'Contribute'
     */
    async assignUserToFolder(
        userId: number,
        folderId: number,
        roleDefinition: string
    ) {
        await this.assertUserId(userId);
        await this.assertFolderId(folderId);
        const folder = this.list.items.getById(folderId);
        if (!this.hasFolderBrokenInheritance(folderId)) {
            await folder.breakRoleInheritance();
        }
        await this.assertRoleDefintion(roleDefinition);
        const foundRole = this.roleDefinitions.find(
            (role) => role.Name === roleDefinition
        );
        this.invalidateCache(folder.roleAssignments.toRequestUrl());
        await folder.roleAssignments.add(userId, foundRole.Id);
    }

    /**
     * Removes user access from folder
     * @param userId
     * @param folderId
     * @param roleDefinition
     */
    async removeUserFromFolder(userId: number, folderId: number) {
        await this.assertUserId(userId);
        await this.assertFolderId(folderId);
        const folder = this.list.items.getById(folderId);
        this.invalidateCache(folder.roleAssignments.toRequestUrl());
        const foundRole = await folder.roleAssignments
            .getById(userId)
            .bindings();
        folder.roleAssignments.remove(userId, foundRole[0].Id);
    }

    private async assertUserId(userId: number) {
        await this.ensureUserAndRoleDefinitionInfo();
        if (!this.userMap.has(userId)) {
            throw Error(`Unknown user with id ${userId}`);
        }
    }

    private async assertFolderId(folderId: number) {
        await this.ensureUserAndRoleDefinitionInfo();
        const folder: { FileSystemObjectType: number } =
            await this.list.items.getById(folderId)();
        if (folder.FileSystemObjectType !== 1) {
            throw Error(`There is no folder with id ${folderId}`);
        }
    }

    private async assertRoleDefintion(roleName: string) {
        await this.ensureUserAndRoleDefinitionInfo();
        const foundRole = this.roleDefinitions.find(
            (role) => role.Name === roleName
        );
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
