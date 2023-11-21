import { IItemUpdateResult, IList, SPFI } from "sp-preset";
import { FeedbackService } from "../../feedback/feedback-service";

class TagServiceProvider {
	private list: IList;

	public initService(sp: SPFI, listName: string): void {
		this.list = sp.web.lists.getByTitle(listName);
	}

	public async getTagOptions(): Promise<string[]> {
		const allItems: { Tags: string[] }[] = await this.list.items.filter(`Tags ne null`).select('Tags')();
		const result = new Set<string>();
		for (let i = 0; i < allItems.length; ++i) {
			const item = allItems[i];
			
			for (let j = 0; j < item.Tags.length; ++j) {
				const tag = item.Tags[j];

				if (!result.has(tag)) {
					result.add(tag);
				}
			}
		}
		return Array.from(result);
	}

	public async addTag(feedbackId: number, tag: string): Promise<IItemUpdateResult> {
		const feedback = await FeedbackService.getFeedback(feedbackId);

		let payload = feedback.Tags;

		if (!Array.isArray(payload)) {
			payload = [tag];
		} else if (payload.indexOf(tag) === -1) {
			payload.push(tag);
		} else {
			return;
		}
		
		return this.list.items.getById(feedbackId).update({ Tags: payload });
	}

	public async removeTag(feedbackId: number, tag: string): Promise<IItemUpdateResult> {
		const feedback = await FeedbackService.getFeedback(feedbackId);

		const payload = feedback.Tags;
		if (!Array.isArray(payload)) return;

		if (payload.indexOf(tag) === -1) return;

		return this.list.items.getById(feedbackId).update({
			Tags: payload.filter((t) => t !== tag),
		})
	}

}

export const TagService = new TagServiceProvider();
