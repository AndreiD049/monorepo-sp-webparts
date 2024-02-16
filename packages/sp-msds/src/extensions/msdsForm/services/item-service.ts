import {
    IAttachmentInfo,
    ICommentInfo,
    IComments,
    IItemAddResult,
    IList,
    SPFI,
} from 'sp-preset';
import { IMSDSRequest } from './IMSDSRequest';

const approvalToValue = {
    Approved: { value: '0', approvalNeeded: '0' },
    Rejected: { value: '1', approvalNeeded: '0' },
    Pending: { value: '2', approvalNeeded: '1' },
    Draft: { value: '3', approvalNeeded: '0' },
};

export class ItemService {
    private static sp: SPFI;
    private static applicationList: IList;

    public static InitService(sp: SPFI): void {
        this.sp = sp;
        this.applicationList = this.sp.web.lists.getByTitle(
            'Web application form'
        );
    }

    public static async getItem(
        customerId: number,
        site: string,
        database: string,
        product: string
    ): Promise<IMSDSRequest[]> {
        const items = this.applicationList.items;
        return items.filter(
            `CustomerNameId eq ${customerId} and Site eq '${site}' and Database eq '${database}' and ProductName eq '${product}'`
        )();
    }

    public static async createItem(
        payload: Partial<IMSDSRequest & { Attachments: File[] }>
    ): Promise<IItemAddResult> {
        const cleanedPayload = { ...payload };
        delete cleanedPayload.CustomerName;
        delete cleanedPayload.Attachments;
        return this.applicationList.items.add(cleanedPayload);
    }

    public static async setApprovalStatus(
        id: number,
        value: keyof typeof approvalToValue
    ): Promise<void> {
        const item = this.applicationList.items.getById(id);
        const translation = approvalToValue[value];
        if (!translation) return;
        await item.validateUpdateListItem(
            [
                {
                    FieldName: '_ModerationStatus',
                    FieldValue: translation.value,
                },
                {
                    FieldName: 'IsApprovalNeeded',
                    FieldValue: translation.approvalNeeded,
                },
            ],
            true
        );
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

    public static async copyAttachments(
        fromId: number,
        toId: number
    ): Promise<void> {
        const from = await this.applicationList.items
            .getById(fromId)
            .attachmentFiles();
        for (const a of from) {
			const content = await this.sp.web.getFileByUrl(a.ServerRelativeUrl).getBlob();
            await this.applicationList.items
                .getById(toId)
                .attachmentFiles.add(a.FileName, content);
        }
    }

    public static async getAttachmentUrl(
        relativePath: string
    ): Promise<string> {
        const link =
            await this.sp.web.getFileByServerRelativePath(relativePath)();
        return link.LinkingUrl || link.ServerRelativeUrl;
    }

    public static async deleteAttachment(relativePath: string): Promise<void> {
        await this.sp.web.getFileByServerRelativePath(relativePath).recycle();
    }

    public static async addComment(
        itemId: number,
        comment: Partial<ICommentInfo>
    ): Promise<ICommentInfo> {
        const item = this.applicationList.items.getById(itemId);
        return item.comments.add(comment as ICommentInfo);
    }

    public static async getComments(itemId: number): Promise<IComments> {
        return this.applicationList.items.getById(itemId).comments();
    }

    public static async deleteComment(
        itemId: number,
        commentId: number
    ): Promise<void> {
        await this.applicationList.items
            .getById(itemId)
            .comments.getById(commentId)
            .delete();
    }
}
