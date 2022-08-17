---
to: src/webparts/<%= h.changeCase.camel(h.webPart) %>/services/<%= Name %>Service.ts
---
import SPBuilder, { IList, InjectHeaders } from 'sp-preset';
import I<%= Name %> from '../models/I<%= Name %>';

export default class <%= h.capitalize(name) %>Service {
    private static spBuilder: SPBuilder;
    private static listTitle: string;
    private static list: IList;

    public static Init(context: any, listTitle: string) {
        this.spBuilder = new SPBuilder(context)
            .withRPM(600)
            .withAdditionalTimelines([
                InjectHeaders({
                    Accept: 'application/json;odata=nometadata',
                }),
            ]);

        this.listTitle = listTitle;
        this.list = this.spBuilder.getSP().web.lists.getByTitle(listTitle)
    }

    public static async get<%= h.inflection.pluralize(Name) %>(filter: string): Promise<I<%= Name %>[]> {
        return this.list.items.filter(filter)();
    }

    public static async get<%= Name %>(id: number): Promise<I<%= Name %>> {
        return this.list.items.getById(id)();
    }

    public static async create<%= Name %>(<%= name.toLowerCase() %>: Partial<I<%= Name %>>) {
        return this.list.items.add(<%= name.toLowerCase() %>);
    }

    public static async create<%= h.inflection.pluralize(Name) %>(<%= h.inflection.pluralize(name) %>: Partial<I<%= Name %>>[]) {
        const [batchedSP, execute] = this.spBuilder.getSP().batched();
        const batchedList = batchedSP.web.lists.getByTitle(this.listTitle);
        <%= h.inflection.pluralize(name) %>.forEach((name) => batchedList.items.add(name));
        await execute();
    }

    public static async update<%= Name %>(id: number, body: Partial<I<%= Name %>>) {
        return this.list.items.getById(id).update(body);
    }

    public static async delete<%= Name %>(id: number) {
        this.list.items.getById(id).delete();
    }

    public static async delete<%= h.inflection.pluralize(Name) %>(ids: number[]) {
        const [batchedSP, execute] = this.spBuilder.getSP().batched();
        const batchedList = batchedSP.web.lists.getByTitle(this.listTitle);
        ids.forEach((id) => batchedList.items.getById(id).delete());
        await execute();
    }
}