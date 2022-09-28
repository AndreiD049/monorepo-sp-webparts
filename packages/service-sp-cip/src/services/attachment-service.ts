import { IFolder, SPFI } from "sp-preset";
import { IAttachments } from "../models/IAttachments";
import { IServiceProps } from "../models/IServiceProps";
import { ITaskOverview } from "../models/ITaskOverview";

const FILE_SELECT = [
  "Files/Name",
  "Files/Length",
  "Files/TimeCreated",
  "Files/TimeLastModified",
  "Files/UniqueId",
  "Files/ServerRelativeUrl",
  "UniqueId",
  "Folders/Name",
  "Folders/UniqueId",
  "Folders/TimeCreated",
  "Folders/TimeLastModified",
  "Folders/ServerRelativeUrl",
];

export class AttachmentService {
  private sp: SPFI;
  private folder: IFolder;
  private taskFolder: (id: number, path?: string) => IFolder;
  private attachmentsPath: string;

  constructor(props: IServiceProps) {
    this.sp = props.sp;
    this.folder = this.sp.web.getFolderByServerRelativePath(props.listName);
    this.taskFolder = (id: number, path?: string) =>
      this.sp.web.getFolderByServerRelativePath(`${props.listName}/${id}${path ? '/' + path : ''}`);
    this.attachmentsPath = props.listName;
  }

  async addAttachments(task: ITaskOverview, attachments: File[], path?: string) {
    await this.ensureFolder(task);
    const calls = attachments.map((attachment) => {
      return this.taskFolder(task.Id, path).files.addUsingPath(
        `${attachment.name}`,
        attachment,
        { Overwrite: true }
      );
    });
    await Promise.all(calls);
  }

  async getAttachments(task: ITaskOverview, path?: string): Promise<IAttachments> {
    return this.taskFolder(task.Id, path)
      .select(...FILE_SELECT)
      .expand("Folders", "Files")();
  }

  async removeAttachment(task: ITaskOverview, filename: string): Promise<void> {
    await this.taskFolder(task.Id).files.getByUrl(filename).recycle();
  }

  async ensureFolder(task: ITaskOverview) {
    try {
      await this.taskFolder(task.Id)();
    } catch (err: any) {
      if (err.message.indexOf("File Not Found") !== -1) {
        const added = await this.folder.addSubFolderUsingPath(
          task.Id.toString()
        );
        const addedFolderItem = await added.listItemAllFields();
        const list = this.sp.web.lists.getByTitle(this.attachmentsPath);
        await list.items.getById(addedFolderItem.Id).update({
          Task: task.Title,
        });
      }
    }
  }
}
