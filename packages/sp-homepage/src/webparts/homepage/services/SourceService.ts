import SPBuilder, { IItemUpdateResult, IList, SPFI } from 'sp-preset';
import HomepageWebPart from '../HomepageWebPart';
import ISource from '../models/ISource';
import IUser from '../models/IUser';

export interface ISourceUserContext {
    user: IUser;
    team?: string;
}

const tagMap: { [key: string]: (ctx: ISourceUserContext) => string } = {
    '@currentUserId': (context: ISourceUserContext) => context.user.Id.toString(),
};

const getTagFromMap = (tag: string): ((ctx: ISourceUserContext) => string) => {
    if (tag in tagMap) {
        return tagMap[tag];
    }
    return null;
};

export const preprocessSourceFilter = (source: ISource, context: ISourceUserContext): ISource => {
    if (!source.filter) return source;

    const copy = { ...source };
    const placeholderRe = /@\w+/g;

    let filter = copy.filter;
    const matches = new Set(filter.match(placeholderRe));

    if (matches.size > 0) {
        matches.forEach((tag) => {
            filter = filter.replaceAll(tag, getTagFromMap(tag)(context));
        });
        copy.filter = filter;
    }

    return copy;
};

export default class SourceService {
    private spBuilder: SPBuilder;
    private sp: SPFI;
    private list: IList;

    public constructor(private source: ISource, private select?: string[], private expand?: string[]) {
        this.spBuilder = HomepageWebPart.spBuilder;
        this.sp = this.spBuilder.getSP(this.source.rootUrl);
        this.list = this.sp.web.lists.getByTitle(this.source.listName);
    }

    public async getSourceData<T>(): Promise<T[]> {
        let filter = this.list.items.filter(this.source.filter);
        if (this.select && this.select.length > 0) {
            filter = filter.select(...this.select);
        }
        if (this.expand && this.expand.length > 0) {
            filter = filter.expand(...this.expand);
        }
        return filter();
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

    public async updateItem<T>(id: number, update: Partial<T>): Promise<IItemUpdateResult> {
        return this.list.items.getById(id).update(update);
    }
}
