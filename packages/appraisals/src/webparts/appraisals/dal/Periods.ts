import IPeriod from './IPeriod';
import { sp } from '@pnp/sp';
import '@pnp/sp/webs';
import '@pnp/sp/lists';
import '@pnp/sp/items';

export async function getPeriods(): Promise<IPeriod[]> {
    return sp.web.lists
        .getByTitle('AppraisalPeriods')
        .items.select('ID', 'Title', 'Status', 'Created', 'Author/Title')
        .expand('Author')
        .get();
}
