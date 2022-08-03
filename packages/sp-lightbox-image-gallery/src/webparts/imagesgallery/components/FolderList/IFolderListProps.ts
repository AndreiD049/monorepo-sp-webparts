import { IFolderInfo } from "sp-preset";

export interface IFolderListProps {
  foldersInfo: IFolderInfo[];
  onClick: (folderInfo: IFolderInfo) => void;
}