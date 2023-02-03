import * as React from 'react';
import { ISiteUserInfo } from 'sp-preset';
import { LookupServiceCached } from '../services/lookup-service';

export function useCurrentUser(): ISiteUserInfo {
    const [user, setUser] = React.useState<ISiteUserInfo>();

    React.useEffect(() => {
        async function run(): Promise<void> {
            setUser(await LookupServiceCached.getCurrentUser());
        }
        run().catch((err) => console.error(err));
    }, []);

    return user;
}
