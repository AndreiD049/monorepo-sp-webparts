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
  "Folders/ItemCount",
  "Folders/TimeLastModified",
  "Folders/ServerRelativeUrl",
];

const getQueryTemplate = (siteId: string, webId: string, listId: string, path: string) => `{searchTerms} (siteId:{${siteId}} OR siteId:${siteId}) (webId:{${webId}} OR webId:${webId}) (NormListID:${listId}) (path:"${path}" OR ParentLink:"${path}*") ContentTypeId:0x0* IsContainer:false`;

export class AttachmentService {
  private sp: SPFI;
  private folder: IFolder;
  private taskFolder: (id: number, path?: string) => IFolder;
  private attachmentsPath: string;
  private listId: Promise<string>;
  private webId: Promise<string>;
  private siteId: Promise<string>;

  constructor(props: IServiceProps) {
    this.sp = props.sp;
    this.folder = this.sp.web.getFolderByServerRelativePath(props.listName);
    this.taskFolder = (id: number, path?: string) =>
      this.sp.web.getFolderByServerRelativePath(`${props.listName}/${id}${path ? '/' + path : ''}`);
    this.attachmentsPath = props.listName;
    this.listId = this.sp.web.lists.getByTitle(props.listName).select('Id')().then((r) => r.Id);
    this.webId = this.sp.web.select('Id')().then((r) => r.Id);
    this.siteId = this.sp.site.select('Id')().then((r) => r.Id);
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

  async addFolder(task: ITaskOverview, folderName: string, path?: string) {
    await this.ensureFolder(task);
    return this.taskFolder(task.Id, path).folders.addUsingPath(folderName);
  }

  async getAttachments(task: ITaskOverview, path?: string): Promise<IAttachments> {
    return this.taskFolder(task.Id, path)
      .select(...FILE_SELECT)
      .expand("Folders", "Files")();
  }

  async moveAttachment(pathFrom: string, pathTo: string) {
    return this.sp.web.getFileByServerRelativePath(pathFrom).moveByPath(pathTo, false, true);
  }

  async removeAttachment(task: ITaskOverview, filename: string, path?: string): Promise<void> {
    await this.taskFolder(task.Id, path).files.getByUrl(filename).recycle();
  }

  async removeFolder(task: ITaskOverview, folderName: string, path?: string): Promise<void> {
    await this.taskFolder(task.Id, path).folders.getByUrl(folderName).recycle();
  }

  async searchInFolder(text: string, task: ITaskOverview, parentPath: string) {
    console.log(getQueryTemplate(await this.siteId, await this.webId, await this.listId, parentPath));
    return this.sp.search({
      Querytext: `${text}`,
      QueryTemplate: getQueryTemplate(await this.siteId, await this.webId, await this.listId, parentPath),
      SummaryLength: 100,
      RowLimit: 6,
      BypassResultTypes: true,
      EnableQueryRules: false,
      ProcessBestBets: false,
      ProcessPersonalFavorites: false,
      TrimDuplicates: false,
    })
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
