import { IItemAddResult, IList, SPFI } from 'sp-preset';
import { IFeedback } from '../../models/IFeedback';

const SELECT = [
    'ID',
    'Title',
    'Category',
    'Status',
    'Description',
    'Application',
    'DevOpsItems',
    'Owner/Id',
    'Owner/Title',
    'Owner/EMail',
	'Created',
    'Author/Id',
    'Author/Title',
    'Author/EMail',
	'Modified',
    'Editor/Id',
    'Editor/Title',
    'Editor/EMail',
    'RemarksBU',
    'Tags',
    'ParentID',
    'Country',
    'Priority',
];

const EXPAND = ['Owner', 'Author', 'Editor'];

class FeedbackServiceProvider {
    private list: IList;

    public initService(sp: SPFI, listName: string): void {
        this.list = sp.web.lists.getByTitle(listName);
    }

    public async addFeedback(
        feedback: Partial<IFeedback>
    ): Promise<IItemAddResult> {
        const result = await this.list.items.add(feedback);
        return result;
    }

    public async getUserFeedbacks(userId: number): Promise<IFeedback[]> {
        const result = await this.list.items
            .select(...SELECT)
            .expand(...EXPAND)
            .filter(`Author/Id eq ${userId}`)();
        return result;
    }
}

export const FeedbackService = new FeedbackServiceProvider();
