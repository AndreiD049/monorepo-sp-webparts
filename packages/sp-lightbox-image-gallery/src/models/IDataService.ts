import { IFolderData } from "./IFolderData";
import { IListInfo } from 'sp-preset';

export interface IDataService {
 getFolderData(folderUniqueId: string): Promise<IFolderData>;
 getLists(): Promise<IListInfo[]>;
}