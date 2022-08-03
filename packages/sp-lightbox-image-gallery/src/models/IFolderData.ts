import { IFileInfo, IFolderInfo } from "sp-preset";

export interface IFolderData {
    folder: IFolderInfo;
    subFolders: IFolderInfo[];
    files: IFileInfo[];
}