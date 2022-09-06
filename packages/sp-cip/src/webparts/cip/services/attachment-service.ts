import CipWebPart, { ICipWebPartProps } from "../CipWebPart";
import { IAttachment } from "../attachments/IAttachment";
import { IFolder, SPFI } from "sp-preset";
import { ITaskOverview } from "@service/sp-cip/dist/models/ITaskOverview";

const FILE_SELECT = ['Name', 'UniqueId'];

export class AttachmentService {
    private sp: SPFI;
    private folder: IFolder;
    private taskFolder: (id: number) => IFolder;
    private attachmentsPath: string;

    constructor(defaultKey: string, properties: ICipWebPartProps) {
        this.sp = CipWebPart.SPBuilder.getSP(defaultKey);
        this.folder = this.sp.web.getFolderByServerRelativePath(properties.config.attachmentsPath);
        this.taskFolder = (id: number) => this.sp.web.getFolderByServerRelativePath(`${properties.config.attachmentsPath}/${id}`);
        this.attachmentsPath = properties.config.attachmentsPath;
    }

    async addAttachments(task: ITaskOverview, attachments: File[]) {
        await this.ensureFolder(task);
        const calls = attachments.map((attachment) => {
            return this.taskFolder(task.Id).files.addUsingPath(`${attachment.name}`, attachment, { Overwrite: true });
        })
        await Promise.all(calls);
    };

    
    getAttachmentsRequest(task: ITaskOverview) {
        return this.taskFolder(task.Id).files.select(...FILE_SELECT);
    }
    
    async getAttachments(task: ITaskOverview): Promise<IAttachment[]> {
        return this.getAttachmentsRequest(task)();
    }

    async removeAttachment(task: ITaskOverview, filename: string): Promise<void> {
        await this.taskFolder(task.Id).files.getByUrl(filename).recycle();
    }

    async ensureFolder(task: ITaskOverview) {
        try {
            await this.taskFolder(task.Id)();
        } catch (err) {
            if (err.message.indexOf('File Not Found') !== -1) {
                const added = await this.folder.addSubFolderUsingPath(task.Id.toString());
                const addedFolderItem = await added.listItemAllFields();    
                const list = this.sp.web.lists.getByTitle(this.attachmentsPath);
                await list.items.getById(addedFolderItem.Id).update({
                    Task: task.Title
                });
            }
        }
    }
};