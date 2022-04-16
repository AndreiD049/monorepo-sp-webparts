import { getSP, Caching, getHashCode, SPFI } from 'sp-preset';

export default class SiteService {
    private sp: SPFI;

    constructor() {
        this.sp = getSP().using(
            Caching({
                keyFactory: (url: string) => `pac-${getHashCode(url)}`,
                store: 'session',
            })
        );
    }

    async getSiteGroups() {
        return this.sp.web.siteGroups.select('Id', 'Title')();
    }

    async getSiteUsers() {
        return this.sp.web.siteUsers.select('Id', 'Title')();
    }

    async getCurrentUser() {
        return this.sp.web.currentUser.select('Id', 'Title')();
    }

    async getCurrentUserGroups() {
        return this.sp.web.currentUser.groups.select('Id', 'Title')();
    }
}
