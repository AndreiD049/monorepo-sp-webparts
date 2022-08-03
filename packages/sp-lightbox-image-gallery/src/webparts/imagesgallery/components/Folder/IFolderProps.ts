import { IFolderInfo } from "sp-preset";

export interface IFolderProps{
    folderInfo: IFolderInfo;
    onClick: (folderInfo: IFolderInfo) => void;
}