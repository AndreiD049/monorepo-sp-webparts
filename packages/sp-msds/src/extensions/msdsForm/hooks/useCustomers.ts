import * as React from 'react';
import { ICustomer, LookupServiceCached } from '../services/lookup-service';
import { ITagWithData, LookupOptions } from './types';

export function useCustomers(): LookupOptions<ICustomer> {
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
            setCustomers(await LookupServiceCached.getAllCustomers());
        }
        run().catch((err) => console.error(err));
    }, []);

    return {
        options: customers,
        set: setCustomers,
        tags: customerTags,
    };
}
