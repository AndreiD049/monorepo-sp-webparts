import * as React from 'react';
import { ICustomer, LookupServiceCached } from '../services/lookup-service';
import { ITagWithData, LookupOptions } from './types';

export function useCustomers(selectedId?: number): LookupOptions<ICustomer> {
    const [customers, setCustomers] = React.useState<ICustomer[]>([]);
    const customerTags: ITagWithData<ICustomer>[] = React.useMemo(() => {
        return customers.map((c) => ({
            name: c.Title,
            key: c.Id,
            data: c,
        }));
    }, [customers]);

    React.useEffect(() => {
        async function run(): Promise<void> {
            const first = await LookupServiceCached.getAllCustomers()
            if (selectedId) {
                first.push(await LookupServiceCached.getCustomer(selectedId));
            }
            setCustomers(first);
        }
        run().catch((err) => console.error(err));
    }, []);

    return {
        options: customers,
        set: setCustomers,
        tags: customerTags,
    };
}
