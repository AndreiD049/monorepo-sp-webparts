import IPeriod from './IPeriod';
import { sp } from '@pnp/sp';
import '@pnp/sp/webs';
import '@pnp/sp/lists';
import '@pnp/sp/items';

const LIST_NAME = 'AppraisalPeriods';
const SELECT = ['ID', 'Title', 'Status', 'Created', 'Author/Title'];
const EXPAND = ['Author'];

export async function getPeriods(): Promise<IPeriod[]> {
    return sp.web.lists
        .getByTitle(LIST_NAME)
        .items.select(...SELECT)
        .expand(...EXPAND)
        .get();
}

export async function getPeriod(id: string): Promise<IPeriod> {
    return sp.web.lists
        .getByTitle(LIST_NAME)
        .items.getById(+id)
        .select(...SELECT)
        .expand(...EXPAND)
        .usingCaching()
        .get();
}

export async function createPeriod(period: Partial<IPeriod>) {
    return sp.web.lists.getByTitle(LIST_NAME).items.add(period);
}

export async function finishPeriod(periodId: string) {
    const period = await getPeriod(periodId);
    if (period.Status === 'Finished') {
        return;
    }
}
