import { IndexedDbCache } from 'indexeddb-manual-cache';
import SPBuilder, { IList, SPFI } from 'sp-preset';
import HomepageWebPart from '../HomepageWebPart';
import ISource from '../models/ISource';
import IUser from '../models/IUser';

const MINUTE = 1000 * 60;
export interface ISourceUserContext {
    user: IUser;
    team?: string;
}

export default class SourceService {
    private spBuilder: SPBuilder;
    private sp: SPFI;
    private list: IList;
    private db: IndexedDbCache;
    private cache;

    public constructor(
        private source: ISource,
        private select?: string[],
        private expand?: string[]
    ) {
        this.spBuilder = HomepageWebPart.spBuilder;
        this.sp = this.spBuilder.getSP(this.source.rootUrl);
        this.list = this.sp.web.lists.getByTitle(this.source.listName);
        this.db = new IndexedDbCache('Homepage_Cache', location.host + location.pathname, {
            expiresIn: MINUTE * source.ttlMinutes,
        });
        this.cache = {
            all: this.db.key(`all-${this.getUniqueKey()}`),
        };
    }

    public async getSourceData<T>(): Promise<T[]> {
        let filter = this.list.items.filter(this.source.filter);
        if (this.select && this.select.length > 0) {
            filter = filter.select(...this.select);
        }
        if (this.expand && this.expand.length > 0) {
            filter = filter.expand(...this.expand);
        }
        return this.cache.all.get(async () => filter());
    }

    public async getItemById<T>(id: number): Promise<T> {
        const req = this.list.items.getById(id);
        if (this.select && this.select.length > 0) {
            req.select(...this.select);
        }
        if (this.expand && this.expand.length > 0) {
            req.expand(...this.expand);
        }
        return req();
    }

    public async updateItem<T extends { Id: number }>(id: number, update: Partial<T>): Promise<T> {
        await this.list.items.getById(id).update(update);
        const updated = await this.getItemById<T>(id);
        await this.cache.all.update<T[]>((prev) => prev.map((i) => (i.Id === id ? updated : i)));
        return updated;
    }

    public async clearCache(): Promise<void> {
        await this.cache.all.remove();
    }

    private getUniqueKey(): string {
        return `${this.source.rootUrl}${this.source.listName}-${this.source.filter}-${
            this.select ? this.select.join(',') : ''
        }${this.expand ? this.expand.join(',') : ''}`;
    }
}


/** Utils */
export const createServices = (sources: ISource[], filter?: (s: ISource) => boolean, select?: string[], expand?: string[]): SourceService[] => {
    let applicableSources = sources;
    if (filter) {
        applicableSources = applicableSources.filter(filter);
    }
    return applicableSources.map((source) => new SourceService(source, select, expand));
};

export const clearCache = async (services: SourceService[]): Promise<void[]> => {
    const calls = services.map(async (s) => s.clearCache());
    return Promise.all(calls);
}
