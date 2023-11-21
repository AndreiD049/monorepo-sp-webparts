import { IFileInfo, IFolder, IList, IShareLinkResponse, SharingLinkKind, SPFI } from 'sp-preset';

class AttachmentsServiceProvider {
    private list: IList;
    private rootFolder: IFolder;
    private sp: SPFI;

    public initService(
        sp: SPFI,
        feedbackListName: string,
        libraryTitle: string
    ): void {
        this.list = sp.web.lists.getByTitle(feedbackListName);
        this.rootFolder = sp.web.folders.getByUrl(libraryTitle);
        this.sp = sp;
		// Just to avoit TS error
		console.log(this.list);
    }

    public async addAttachments(id: number, files: File[]): Promise<void> {
        const exists = await this.checkFolderExists(id.toString());
        if (!exists) {
            await this.createAttachmentFolder(id.toString());
        }
        for (const file of files) {
            await this.rootFolder.folders
                .getByUrl(id.toString())
                .files.addUsingPath(file.name, file, { Overwrite: true });
        }
    }

    public async getFeedbackAttachments(id: number): Promise<IFileInfo[]> {
        const exists = await this.checkFolderExists(id.toString());
        if (!exists) {
            await this.createAttachmentFolder(id.toString());
        }
        return this.rootFolder.folders.getByUrl(id.toString()).files.orderBy('TimeCreated')();
    }

    public async getAttachmentShareLink(serverRelativeUrl: string): Promise<IShareLinkResponse> {
        return this.sp.web
            .getFileByServerRelativePath(serverRelativeUrl)
            .getShareLink(
                SharingLinkKind.OrganizationView,
                new Date(Date.now() + 1000 * 60 * 5)
            );
    }

	public async getFeedbackFolderShareLink(id: number): Promise<IShareLinkResponse> {
		return this.rootFolder.folders.getByUrl(id.toString()).getShareLink(
			SharingLinkKind.OrganizationView,
			new Date(Date.now() + 1000 * 60 * 5)
		);
	}

    public async checkFolderExists(folderName: string): Promise<boolean> {
        const folder = await this.rootFolder.folders.filter(
            `Name eq '${folderName}'`
        )();
        return folder.length > 0;
    }

    public async createAttachmentFolder(folderName: string): Promise<void> {
        await this.rootFolder.folders.addUsingPath(folderName);
    }

    public async deleteFeedbackAttachment(serverRelativeUrl: string): Promise<void> {
		await this.sp.web.getFileByServerRelativePath(serverRelativeUrl).recycle();
    }
}

export const AttachmentService = new AttachmentsServiceProvider();
