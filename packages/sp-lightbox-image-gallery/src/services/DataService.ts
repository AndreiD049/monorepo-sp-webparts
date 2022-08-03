import { IDataService } from '../models/IDataService';
import { IFolderInfo, IFolder } from '@pnp/sp/folders';
import { IFileInfo } from '@pnp/sp/files';
import { IListInfo } from '@pnp/sp/lists';
import { IFolderData } from '../models/IFolderData';
import { SPFI } from 'sp-preset';
import ImagesGalleryWebPart from '../webparts/imagesgallery/ImagesGalleryWebPart';

export default class DataService implements IDataService {
  private sp: SPFI;

  constructor() {
    this.sp = ImagesGalleryWebPart.SPBuilder.getSP();
  }

  public async getLists(): Promise<IListInfo[]> {
    let lists = await this.sp.web.lists
      .select('Title', 'BaseTemplate', 'RootFolder')
      .expand('RootFolder')();
    lists = lists.filter(
      (item) => item['BaseTemplate'] === 109 || item['BaseTemplate'] === 101
    );
    return lists;
  }

  public async getFolderData(folderUniqueId: string): Promise<IFolderData> {
    let folder = await this.sp.web.getFolderById(folderUniqueId);
    let folderInfo = await folder();
    let subFolders = await this.getSubFolders(folder);
    let files = await this.getFilesFromFolder(folder);

    return {
      folder: folderInfo,
      subFolders: subFolders,
      files: files,
    };
  }

  private async getSubFolders(folder: IFolder): Promise<IFolderInfo[]> {
    let folders = await folder.folders.orderBy('TimeCreated', false)();
    folders = folders.filter((sf) => !sf.IsWOPIEnabled && sf.ItemCount > 0);
    return folders;
  }

  private async getFilesFromFolder(folder: IFolder): Promise<IFileInfo[]> {
    let files = await folder.files.orderBy('TimeCreated', true)();
    files = files.filter(
      (fileData) =>
        ['jpg', 'jpeg', 'png'].indexOf(
          fileData.Name.toLocaleLowerCase().split('.').pop()
        ) !== -1
    );
    return files;
  }
}
