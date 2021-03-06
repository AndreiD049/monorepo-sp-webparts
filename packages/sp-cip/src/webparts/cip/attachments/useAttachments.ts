import * as React from "react";
import CipWebPart from "../CipWebPart";
import { ITaskOverview } from "../tasks/ITaskOverview";
import { GlobalContext } from "../utils/GlobalContext";
import { IAttachment } from "./IAttachment";

const FILE_SELECT = ['Name', 'UniqueId'];

export const useAttachments = () => {
    const { properties } = React.useContext(GlobalContext);
    const sp = React.useMemo(() => CipWebPart.SPBuilder.getSP('Data'), []);
    const folder = sp.web.getFolderByServerRelativePath(properties.attachmentsPath);
    const taskFolder = (id: number) => sp.web.getFolderByServerRelativePath(`${properties.attachmentsPath}/${id}`);

    const addAttachments = async (task: ITaskOverview, attachments: File[]) => {
        await ensureFolder(task);
        const calls = attachments.map((attachment) => {
            return taskFolder(task.Id).files.addUsingPath(`${attachment.name}`, attachment, { Overwrite: true });
        })
        await Promise.all(calls);
    };

    
    const getAttachmentsRequest = (task: ITaskOverview) => {
        return taskFolder(task.Id).files.select(...FILE_SELECT);
    }
    
    const getAttachments = async (task: ITaskOverview): Promise<IAttachment[]> => {
        return getAttachmentsRequest(task)();
    }

    const removeAttachment = async (task: ITaskOverview, filename: string): Promise<void> => {
        await taskFolder(task.Id).files.getByUrl(filename).recycle();
    }

    const ensureFolder = async (task: ITaskOverview) => {
        try {
            await taskFolder(task.Id)();
        } catch (err) {
            if (err.message.indexOf('File Not Found') !== -1) {
                const added = await folder.addSubFolderUsingPath(task.Id.toString());
                const addedFolderItem = await added.listItemAllFields();    
                const list = sp.web.lists.getByTitle(properties.attachmentsPath);
                await list.items.getById(addedFolderItem.Id).update({
                    Task: task.Title
                });
            }
        }
    }

    return { getAttachmentsRequest, getAttachments, removeAttachment, addAttachments };
};
