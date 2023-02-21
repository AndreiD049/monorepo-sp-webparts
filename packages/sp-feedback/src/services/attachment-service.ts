import { getGUID, IFolder, SPFI } from "sp-preset";

export class AttachmentService {
    private serverFolder: IFolder;
    private serverRelativeUrl: Promise<string>;

    constructor(private sp: SPFI, folder: string) {
        this.serverFolder = this.sp.web.getFolderByServerRelativePath(folder);
        this.serverRelativeUrl = this.serverFolder().then((s) => s.ServerRelativeUrl);
    }
    
    public async attachFile(blob: Blob): Promise<string> {
        const extension = blob.type.split('/')[1];
        const filename = getGUID() + '.' + extension;
        await this.serverFolder.files.addUsingPath(filename, blob);
        return `${await this.serverRelativeUrl}/${filename}`;
    }
}