import IPeriod from './IPeriod';
import { getNewSP, getSP, SPFI } from 'sp-preset';

const LIST_NAME = 'AppraisalPeriods';
const SELECT = ['ID', 'Title', 'Status', 'Created', 'Author/Title'];
const EXPAND = ['Author'];


export default class PeriodService {
    private sp: SPFI;

    constructor() {
        this.sp = getSP('Default');
    }
    
    async getPeriods(): Promise<IPeriod[]> {
        return this.sp.web.lists
            .getByTitle(LIST_NAME)
            .items.select(...SELECT)
            .expand(...EXPAND)();
    }
    async getPeriod(id: string): Promise<IPeriod> {
        return this.sp.web.lists
            .getByTitle(LIST_NAME)
            .items.getById(+id)
            .select(...SELECT)
            .expand(...EXPAND)();
    }
    
    async createPeriod(period: Partial<IPeriod>) {
        return this.sp.web.lists.getByTitle(LIST_NAME).items.add(period);
    }
    
    async finishPeriod(periodId: string) {
        const period = await this.getPeriod(periodId);
        if (period.Status === 'Finished') {
            return;
        }
        const update: Partial<IPeriod> = {
            Status: 'Finished',
        };
        const updated = await this.sp.web.lists
            .getByTitle(LIST_NAME)
            .items.getById(+periodId)
            .update(update);
        return updated.item();
    }
}


