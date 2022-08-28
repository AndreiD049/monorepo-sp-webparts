import SPBuilder, { SPFI } from 'sp-preset';
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

    public constructor(private source: ISource) {
        this.spBuilder = HomepageWebPart.spBuilder;
        this.sp = this.spBuilder.getSP(this.source.rootUrl);
    }

    public async getSourceData<T>(): Promise<T> {
        let filter = this.sp.web.lists
            .getByTitle(this.source.listName)
            .items.filter(this.source.filter);
        if (this.source.select && this.source.select.length > 0) {
            filter = filter.select(...this.source.select);
        }
        if (this.source.expand && this.source.expand.length > 0) {
            filter = filter.expand(...this.source.expand);
        }
        return filter();
    }
}
