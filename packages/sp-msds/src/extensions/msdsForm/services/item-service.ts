import { IAttachmentInfo, IItemAddResult, IList, SPFI } from 'sp-preset';
import { IMSDSRequest } from './IMSDSRequest';

export class ItemService {
    private static sp: SPFI;
    private static applicationList: IList;

    public static InitService(sp: SPFI): void {
        this.sp = sp;
        this.applicationList = this.sp.web.lists.getByTitle(
            'Web application form'
        );
    }

    public static async createItem(
        payload: Partial<IMSDSRequest & { Attachments: File[] }>
    ): Promise<IItemAddResult> {
        const cleanedPayload = { ...payload };
        delete cleanedPayload.CustomerName;
        delete cleanedPayload.Attachments;
        return this.applicationList.items.add(cleanedPayload);
    }

    public static async updateItem(
        id: number,
        payload: Partial<IMSDSRequest>
    ): Promise<IItemAddResult> {
        return this.applicationList.items.getById(id).update(payload);
    }

    public static async addAttachments(
        itemId: number,
        attachments: File[]
    ): Promise<void> {
        for (const a of attachments) {
            await this.applicationList.items
                .getById(itemId)
                .attachmentFiles.add(a.name, await a.arrayBuffer());
        }
    }

    public static async addAttachment(
        itemId: number,
        attachment: File
    ): Promise<void> {
        await this.applicationList.items
            .getById(itemId)
            .attachmentFiles.add(
                attachment.name,
                await attachment.arrayBuffer()
            );
    }

    public static async getAttachments(
        itemId: number
    ): Promise<IAttachmentInfo[]> {
        return this.applicationList.items.getById(itemId).attachmentFiles();
    }

    public static async getAttachmentUrl(
        relativePath: string
    ): Promise<string> {
        const link = await this.sp.web.getFileByServerRelativePath(
            relativePath
        )();
        return link.LinkingUrl || link.ServerRelativeUrl;
    }

    public static async deleteAttachment(relativePath: string): Promise<void> {
        await this.sp.web.getFileByServerRelativePath(relativePath).recycle();
    }
}
