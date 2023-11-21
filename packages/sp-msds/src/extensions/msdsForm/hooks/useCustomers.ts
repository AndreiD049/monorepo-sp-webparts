import * as React from 'react';
import { ICustomer, LookupServiceCached } from '../services/lookup-service';
import { ITagWithData, LookupOptions } from './types';

export function useCustomers(database: string, selectedId?: number): LookupOptions<ICustomer> {
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
			if (!database) {
				setCustomers([]);
				return;
			}
            const first = await LookupServiceCached.getAllCustomers(database)
            if (selectedId) {
                first.push(await LookupServiceCached.getCustomer(selectedId));
            }
            setCustomers(first);
        }
        run().catch((err) => console.error(err));
    }, [database]);

    return {
        options: customers,
        set: setCustomers,
        tags: customerTags,
    };
}
