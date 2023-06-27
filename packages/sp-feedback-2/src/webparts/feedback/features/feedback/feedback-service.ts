import { IItemAddResult, IList, SPFI } from "sp-preset";
import { IFeedback } from "../../models/IFeedback";

class FeedbackServiceProvider {
	private list: IList;

	public initService(sp: SPFI, listName: string): void {
		this.list = sp.web.lists.getByTitle(listName);
	}

	public async addFeedback(feedback: Partial<IFeedback>): Promise<IItemAddResult> {
		const result = await this.list.items.add(feedback);
		return result;
	}
}

export const FeedbackService = new FeedbackServiceProvider();
