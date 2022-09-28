import { IAttachmentFile } from "./IAttachmentFile";
import { IAttachmentFolder } from "./IAttachmentFolder";

export interface IAttachments {
  Files: IAttachmentFile[];
  Folders: IAttachmentFolder[];
  UniqueId: string;
}
